import type { CollectionBeforeOperationHook, PayloadRequest } from 'payload'
import { getSanitizedUploadFilename } from 'payload/shared'

const splitExtension = (name: string): [stem: string, extension: string] => {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
}

const nextStem = (stem: string) => {
  const numbered = /^(.*)-(\d+)$/.exec(stem)
  return numbered ? `${numbered[1]}-${BigInt(numbered[2]) + 1n}` : `${stem}-1`
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// The collections whose files share the public Blob store, each checked against its own names.
export const PUBLIC_UPLOAD_SLUGS = ['media', 'testimonial-proofs'] as const

export type PublicUploadSlug = (typeof PUBLIC_UPLOAD_SLUGS)[number]

export const isPublicUploadSlug = (slug: unknown): slug is PublicUploadSlug =>
  PUBLIC_UPLOAD_SLUGS.some((known) => known === slug)

const isStemTaken = async (req: PayloadRequest, collection: PublicUploadSlug, stem: string) => {
  const sizeNames = (req.payload.collections[collection].config.upload.imageSizes ?? []).map((size) => size.name)
  const nameFields = ['filename', ...sizeNames.map((name) => `sizes.${name}.filename`)]
  const { docs } = await req.payload.find({
    collection,
    where: { or: nameFields.map((field) => ({ [field]: { like: stem } })) },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  const clash = new RegExp(`^${escapeRegExp(stem)}(-\\d+x\\d+)?$`)
  return docs.some((doc) =>
    [doc.filename, ...Object.values(('sizes' in doc && doc.sizes) || {}).map((size) => size?.filename)].some(
      (name) => typeof name === 'string' && clash.test(splitExtension(name)[0]),
    ),
  )
}

export const freeUploadFileName = async (
  req: PayloadRequest,
  collection: PublicUploadSlug,
  desiredFilename: string,
): Promise<string> => {
  const [desiredStem, extension] = splitExtension(getSanitizedUploadFilename(desiredFilename))
  let stem = desiredStem
  while (await isStemTaken(req, collection, stem)) stem = nextStem(stem)
  return `${stem}${extension}`
}

export const giveNewUploadAFreeName: CollectionBeforeOperationHook = async ({ collection, operation, overrideAccess, req }) => {
  if (operation !== 'create' || !req.file || !(overrideAccess || req.user)) return
  if (!isPublicUploadSlug(collection.slug)) throw new Error(`giveNewUploadAFreeName does not know the ${collection.slug} collection.`)
  const name = await freeUploadFileName(req, collection.slug, req.file.name)
  if (name !== req.file.name) req.file = { ...req.file, name }
}
