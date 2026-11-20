import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import { randomUUID } from 'node:crypto'
import type { Payload } from 'payload'

import type { Inquiry } from '@/payload-types'

import type { BookInquiryInput, InquiryInput } from './schema'

const UPLOAD_LINKS = 'inquiry-upload-links'
const DUPLICATE_KEY = 11000

type UploadLink = { _id: string; linkedAt: Date; claim: string }

export type SubmitResult = { ok: true; inquiry: Inquiry } | { ok: false; reason: 'upload_unavailable' }

function uploadLinks(payload: Payload) {
  if (payload.db.name !== 'mongoose') {
    throw new Error(`Linking inquiry uploads needs the MongoDB adapter; this app runs ${payload.db.name}.`)
  }
  return (payload.db as MongooseAdapter).connection.collection<UploadLink>(UPLOAD_LINKS)
}

function isDuplicateKey(error: unknown): boolean {
  const { code, writeErrors } = error as { code?: unknown; writeErrors?: { code?: unknown }[] }
  return code === DUPLICATE_KEY || (writeErrors ?? []).some((writeError) => writeError.code === DUPLICATE_KEY)
}

type Claim = { ok: true; release: () => Promise<void> } | { ok: false }

async function claimUploads(payload: Payload, uploadIds: string[]): Promise<Claim> {
  if (uploadIds.length === 0) return { ok: true, release: async () => {} }

  const { totalDocs } = await payload.count({ collection: 'inquiry-uploads', where: { id: { in: uploadIds } } })
  if (totalDocs !== uploadIds.length) return { ok: false }

  const links = uploadLinks(payload)
  const claim = randomUUID()
  const release = async () => {
    await links.deleteMany({ _id: { $in: uploadIds }, claim })
  }
  const linkedAt = new Date()
  try {
    await links.insertMany([...uploadIds].sort().map((_id) => ({ _id, linkedAt, claim })))
    return { ok: true, release }
  } catch (error) {
    await release()
    if (isDuplicateKey(error)) return { ok: false }
    throw error
  }
}

async function createLinked(
  payload: Payload,
  uploadIds: string[],
  create: () => Promise<Inquiry>,
): Promise<SubmitResult> {
  const claim = await claimUploads(payload, uploadIds)
  if (!claim.ok) return { ok: false, reason: 'upload_unavailable' }
  try {
    return { ok: true, inquiry: await create() }
  } catch (error) {
    await claim.release()
    throw error
  }
}

export async function submitInquiry(payload: Payload, input: InquiryInput): Promise<SubmitResult> {
  const { uploadId } = input
  return createLinked(payload, uploadId ? [uploadId] : [], () =>
    payload.create({
      collection: 'inquiries',
      data: {
        status: 'new',
        name: input.name,
        contact: input.contact,
        interests: input.interests,
        needBy: input.needBy,
        upload: uploadId,
        newsOptIn: input.newsOptIn,
      },
    }),
  )
}

async function publishedPieceId(payload: Payload, slug: string | undefined): Promise<string | undefined> {
  if (!slug) return undefined
  const { docs } = await payload.find({
    collection: 'pieces',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    select: { slug: true },
  })
  return docs[0]?.id
}

export async function submitBookInquiry(payload: Payload, input: BookInquiryInput): Promise<SubmitResult> {
  const uploadIds = input.uploadIds ?? []
  const piece = await publishedPieceId(payload, input.piece)
  return createLinked(payload, uploadIds, () =>
    payload.create({
      collection: 'inquiries',
      depth: 1,
      data: {
        status: 'new',
        form: 'book',
        name: input.name,
        email: input.email,
        phone: input.phone,
        contactWay: input.contactWay,
        pieceType: input.pieceType,
        budget: input.budget,
        description: input.description,
        piece,
        uploads: uploadIds,
        needBy: input.needBy,
        newsOptIn: input.newsOptIn,
      },
    }),
  )
}
