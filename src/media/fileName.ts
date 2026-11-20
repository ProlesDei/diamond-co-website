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

const isStemTaken = async (req: PayloadRequest, stem: string) => {
  const sizeNames = (req.payload.collections.media.config.upload.imageSizes ?? []).map((size) => size.name)
  const nameFields = ['filename', ...sizeNames.map((name) => `sizes.${name}.filename`)]
  const { docs } = await req.payload.find({
    collection: 'media',
    where: { or: nameFields.map((field) => ({ [field]: { contains: stem } })) },
    select: { filename: true, sizes: true },
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  const clash = new RegExp(`^${escapeRegExp(stem)}(-\\d+x\\d+)?$`)
  return docs.some((doc) =>
    [doc.filename, ...Object.values(doc.sizes ?? {}).map((size) => size?.filename)].some(
      (name) => typeof name === 'string' && clash.test(splitExtension(name)[0]),
    ),
  )
}

export const freeMediaFileName = async (req: PayloadRequest, desiredFilename: string): Promise<string> => {
  const [desiredStem, extension] = splitExtension(getSanitizedUploadFilename(desiredFilename))
  let stem = desiredStem
  while (await isStemTaken(req, stem)) stem = nextStem(stem)
  return `${stem}${extension}`
}

export const giveNewUploadAFreeName: CollectionBeforeOperationHook = async ({ operation, overrideAccess, req }) => {
  if (operation !== 'create' || !req.file || !(overrideAccess || req.user)) return
  const name = await freeMediaFileName(req, req.file.name)
  if (name !== req.file.name) req.file = { ...req.file, name }
}
