import { BlobNotFoundError, del, head, list, type ListBlobResultBlob } from '@vercel/blob'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import type { Payload } from 'payload'

import { readBlobToken } from '../lib/blob'
import { PENDING_PREFIX } from './directUpload'
import { abortAfterTimeout, INQUIRY_BLOB_PREFIX, pathnameOf } from './storage'
import { claimUploads, UPLOAD_LINKS, uploadIdsOf } from './submit'
import { CLIENT_TOKEN_MS } from './upload'

const MINUTE_MS = 60 * 1000

export const UNLINKED_UPLOAD_MAX_AGE_MS = 24 * 60 * 60 * 1000
// Past the token's lifetime, the margin lets an upload that started just before it ran out finish,
// within the page's own transfer timeout, and be confirmed.
export const PENDING_BLOB_MAX_AGE_MS = CLIENT_TOKEN_MS + 15 * MINUTE_MS

export type PrunedUpload = { id: string; fileGone: boolean }

export type PruneResult = {
  uploads: PrunedUpload[]
  orphanBlobs?: string[]
  pendingBlobs?: string[]
}

type OldBlobs = { orphanBlobs: string[]; pendingBlobs: string[] }

async function step<T>(name: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    throw new Error(`${name} failed, so the prune stopped and deleted nothing more: ${(error as Error).message}`, {
      cause: error,
    })
  }
}

async function releaseAfterFailure(
  payload: Payload,
  release: () => Promise<void>,
  id: string,
  failure: unknown,
  recheckFile: (() => Promise<boolean>) | undefined,
): Promise<void> {
  let recordKept: boolean
  try {
    const record = await payload.findByID({
      collection: 'inquiry-uploads',
      id,
      depth: 0,
      disableErrors: true,
      overrideAccess: true,
    })
    recordKept = record !== null
  } catch (error) {
    throw new Error(
      `${(failure as Error).message}. Checking whether upload ${id}'s record is still there also failed, so the prune kept its claim: requests naming it are refused until its row (_id ${id}) is removed from ${UPLOAD_LINKS}. If upload ${id} is still in inquiry-uploads, delete it in the admin first, then remove its row (_id ${id}) from ${UPLOAD_LINKS}: ${(error as Error).message}`,
      { cause: failure },
    )
  }
  if (!recordKept) {
    throw new Error(
      `${(failure as Error).message}. Upload ${id}'s record is already deleted, so the prune kept its claim: its row (_id ${id}) stays in ${UPLOAD_LINKS}, and requests naming the upload are refused.`,
      { cause: failure },
    )
  }
  if (recheckFile) {
    const recovery = `requests naming it are refused until you delete upload ${id} in the admin, then remove its row (_id ${id}) from ${UPLOAD_LINKS}`
    let fileGone: boolean
    try {
      fileGone = await recheckFile()
    } catch (error) {
      throw new Error(
        `${(failure as Error).message}. Upload ${id}'s record is still there, but checking whether its file is still there also failed, so the prune kept its claim: ${recovery}: ${(error as Error).message}`,
        { cause: failure },
      )
    }
    if (fileGone) {
      throw new Error(
        `${(failure as Error).message}. Upload ${id}'s record is still there but its file is gone, so the prune kept its claim: ${recovery}.`,
        { cause: failure },
      )
    }
  }
  try {
    await release()
  } catch (error) {
    throw new Error(
      `${(failure as Error).message}. Releasing the prune's claim on upload ${id} also failed, so requests naming it are refused until its row (_id ${id}) is removed from ${UPLOAD_LINKS}: ${(error as Error).message}`,
      { cause: failure },
    )
  }
}

async function fileGoneOnDisk(staticDir: string, filename: string | null | undefined): Promise<boolean> {
  if (!filename) return true
  try {
    await stat(path.join(staticDir, filename))
    return false
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return true
    throw error
  }
}

async function blobGone(token: string, filename: string | null | undefined): Promise<boolean> {
  if (!filename) return true
  try {
    await head(pathnameOf(filename), { abortSignal: abortAfterTimeout(), token })
    return false
  } catch (error) {
    if (error instanceof BlobNotFoundError) return true
    throw error
  }
}

async function linkedIds(payload: Payload, ids: string[]): Promise<Set<string>> {
  const { docs } = await payload.find({
    collection: 'inquiries',
    where: { or: [{ upload: { in: ids } }, { uploads: { in: ids } }] },
    depth: 0,
    pagination: false,
    select: { upload: true, uploads: true },
    overrideAccess: true,
  })
  return new Set(docs.flatMap(uploadIdsOf))
}

async function blobsUnderPrefix(token: string): Promise<ListBlobResultBlob[]> {
  const blobs: ListBlobResultBlob[] = []
  let cursor: string | undefined
  do {
    const page = await list({ prefix: INQUIRY_BLOB_PREFIX, cursor, abortSignal: abortAfterTimeout(), token })
    blobs.push(...page.blobs)
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return blobs
}

async function filenamesInUse(payload: Payload, filenames: string[]): Promise<Set<string>> {
  const { docs } = await payload.find({
    collection: 'inquiry-uploads',
    where: { filename: { in: filenames } },
    depth: 0,
    pagination: false,
    select: { filename: true },
    overrideAccess: true,
  })
  return new Set(docs.flatMap((doc) => (doc.filename ? [doc.filename] : [])))
}

const filenameOf = (pathname: string): string => pathname.slice(INQUIRY_BLOB_PREFIX.length)

const isPending = (pathname: string): boolean => pathname.startsWith(PENDING_PREFIX)

async function findOldBlobs(payload: Payload, token: string, now: number): Promise<OldBlobs> {
  const blobs = await step(`listing blobs under ${INQUIRY_BLOB_PREFIX}`, () => blobsUnderPrefix(token))
  const olderThan = (pending: boolean, maxAge: number): string[] =>
    blobs
      .filter((blob) => isPending(blob.pathname) === pending && blob.uploadedAt.getTime() < now - maxAge)
      .map((blob) => blob.pathname)
  const old = olderThan(false, UNLINKED_UPLOAD_MAX_AGE_MS)
  const oldPending = olderThan(true, PENDING_BLOB_MAX_AGE_MS)
  if (old.length === 0 && oldPending.length === 0) return { orphanBlobs: [], pendingBlobs: [] }
  const inUse = await step(`finding uploads that point at blobs under ${INQUIRY_BLOB_PREFIX}`, () =>
    filenamesInUse(
      payload,
      blobs.map((blob) => filenameOf(blob.pathname)),
    ),
  )
  if (old.length > 0 && inUse.size === 0) {
    throw new Error(
      `refused, deleting nothing: no upload in the database points at any of the ${blobs.length} blob(s) under ${INQUIRY_BLOB_PREFIX}, so the database may not be the one this store's uploads are recorded in. Check that DATABASE_URL names that database. If the store truly holds only orphans, delete them in the store's Vercel dashboard.`,
    )
  }
  const unused = (pathnames: string[]): string[] => pathnames.filter((pathname) => !inUse.has(filenameOf(pathname)))
  return { orphanBlobs: unused(old), pendingBlobs: unused(oldPending) }
}

export async function pruneUnlinkedUploads(
  payload: Payload,
  { dryRun, now = new Date() }: { dryRun: boolean; now?: Date },
): Promise<PruneResult> {
  const token = readBlobToken('inquiry-uploads')
  const cutoff = now.getTime() - UNLINKED_UPLOAD_MAX_AGE_MS
  const oldBlobs = token ? await findOldBlobs(payload, token, now.getTime()) : undefined
  const { docs: old } = await step('finding uploads older than 24 hours', () =>
    payload.find({
      collection: 'inquiry-uploads',
      where: { createdAt: { less_than: new Date(cutoff).toISOString() } },
      depth: 0,
      pagination: false,
      select: { filename: true },
      overrideAccess: true,
    }),
  )

  const uploads: PrunedUpload[] = []
  if (old.length > 0) {
    const linked = await step('finding requests linked to those uploads', () =>
      linkedIds(
        payload,
        old.map((upload) => upload.id),
      ),
    )
    let fileGone: (filename: string | null | undefined) => Promise<boolean>
    if (token) {
      fileGone = (filename) => blobGone(token, filename)
    } else {
      const { upload } = payload.collections['inquiry-uploads'].config
      if (!upload || !upload.staticDir) throw new Error('inquiry-uploads has no upload folder configured.')
      const { staticDir } = upload
      fileGone = (filename) => fileGoneOnDisk(staticDir, filename)
    }

    for (const doc of old) {
      if (linked.has(doc.id)) continue
      const claim = dryRun
        ? undefined
        : await step(`claiming upload ${doc.id} in ${UPLOAD_LINKS}`, () => claimUploads(payload, [doc.id]))
      if (claim && !claim.ok) continue
      let recheckFile: (() => Promise<boolean>) | undefined
      try {
        const gone = await step(`checking upload ${doc.id}'s file`, () => fileGone(doc.filename))
        recheckFile = () => fileGone(doc.filename)
        if (claim) {
          await step(`deleting upload ${doc.id}`, () =>
            payload.delete({ collection: 'inquiry-uploads', id: doc.id, overrideAccess: true }),
          )
        }
        uploads.push({ id: doc.id, fileGone: gone })
      } catch (error) {
        if (claim) await releaseAfterFailure(payload, claim.release, doc.id, error, recheckFile)
        throw error
      }
    }
  }

  if (!token || !oldBlobs) return { uploads }
  const { orphanBlobs, pendingBlobs } = oldBlobs
  if (!dryRun) {
    for (const pathname of pendingBlobs) {
      await step(`deleting pending blob ${pathname}`, () => del(pathname, { abortSignal: abortAfterTimeout(), token }))
    }
    for (const pathname of orphanBlobs) {
      await step(`deleting orphan blob ${pathname}`, () => del(pathname, { abortSignal: abortAfterTimeout(), token }))
    }
  }
  return { uploads, orphanBlobs, pendingBlobs }
}
