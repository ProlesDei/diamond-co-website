import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import { randomUUID } from 'node:crypto'
import type { Payload } from 'payload'

import type { Inquiry } from '@/payload-types'

import type { BookInquiryInput } from './schema'

export const UPLOAD_LINKS = 'inquiry-upload-links'
const DUPLICATE_KEY = 11000

type UploadLink = { _id: string; linkedAt: Date; claim: string }

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

export function uploadIdsOf(inquiry: Pick<Inquiry, 'upload' | 'uploads'>): string[] {
  return [inquiry.upload, ...(inquiry.uploads ?? [])].flatMap((upload) =>
    upload ? [typeof upload === 'string' ? upload : upload.id] : [],
  )
}

export async function releaseUploadLinks(payload: Payload, uploadIds: string[]): Promise<void> {
  if (uploadIds.length === 0) return
  await uploadLinks(payload).deleteMany({ _id: { $in: uploadIds } })
}

type Claim = { ok: true; release: () => Promise<void> } | { ok: false }

export async function claimUploads(payload: Payload, uploadIds: string[]): Promise<Claim> {
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

export async function submitBookInquiry(payload: Payload, input: BookInquiryInput): Promise<Inquiry> {
  const piece = await publishedPieceId(payload, input.piece)
  return payload.create({
    collection: 'inquiries',
    depth: 1,
    data: {
      status: 'new',
      form: 'book',
      pieceType: input.pieceType,
      budget: input.budget,
      description: input.description,
      piece,
    },
  })
}
