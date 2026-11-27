import { buildUploadStoragePathData } from '@payloadcms/plugin-cloud-storage/utilities'
import { del, head } from '@vercel/blob'
import { CLIENT_UPLOAD_CONTEXT_CONTEXT_KEY, FileUploadError } from 'payload'
import type {
  CollectionAfterErrorHook,
  CollectionAfterOperationHook,
  CollectionBeforeOperationHook,
  PayloadRequest,
} from 'payload'

import { requireBlobToken } from '@/lib/blob'

type StagedUpload = { docPrefix: string; filename: string; objectKey: string; pathname: string }
const stagedUploads = new WeakMap<PayloadRequest, StagedUpload>()

export const trackStagedUpload: CollectionBeforeOperationHook = ({ operation, req }) => {
  if ((operation !== 'create' && operation !== 'update') || !req.user || !req.file) return
  // Payload sets this context from the verified receipt after fetching the staged file.
  const context = req.context[CLIENT_UPLOAD_CONTEXT_CONTEXT_KEY]
  if (!context || typeof context !== 'object' || !('_objectKey' in context)) return
  const objectKey = context._objectKey
  if (typeof objectKey !== 'string' || !objectKey) return
  const prefix = 'prefix' in context && typeof context.prefix === 'string' ? context.prefix : ''
  const filename = req.file.name
  const docPrefix = [prefix, objectKey].filter(Boolean).join('/')
  const { storageFilePath: pathname } = buildUploadStoragePathData({ docPrefix, filename })
  stagedUploads.set(req, { docPrefix, filename, objectKey, pathname })
}

const deleteStagedUpload = async (req: PayloadRequest, pathname: string) => {
  try {
    await del(pathname, { token: requireBlobToken('media') })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Could not remove a staged Media upload' })
  }
}

export const removeReplacedStagingFile: CollectionAfterOperationHook<'media'> = async ({ operation, result, req }) => {
  if (req.context.skipCloudStorage) return result
  const staged = stagedUploads.get(req)
  if (!staged || !result) return result

  // A by-ID save returns the doc. A filtered PATCH returns `docs`; clean up only when it
  // saved exactly one, and leave the staged file when it changed several.
  let id: number | string | undefined
  if (operation === 'create' || operation === 'updateByID') id = result.id
  else if (operation === 'update' && result.docs.length === 1) id = result.docs[0]?.id
  if (id === undefined) return result

  // Read the saved docs instead of `result`, which holds only the fields the caller selected.
  // A retry with the same receipt shares the object key with an earlier save, and the staged
  // file may be the only full copy that save has, so keep it whenever another doc shares the key.
  try {
    const { docs } = await req.payload.find({
      collection: 'media',
      depth: 0,
      overrideAccess: true,
      pagination: false,
      select: { filename: true },
      where: { _objectKey: { equals: staged.objectKey } },
      req,
    })
    const saved = docs.find((doc) => doc.id === id)
    if (docs.length !== 1 || !saved?.filename || saved.filename === staged.filename) return result

    // Payload can skip the storage upload, for example when the caller selects only some
    // fields. Keep the staged file unless the saved file is in the store.
    const { storageFilePath } = buildUploadStoragePathData({ docPrefix: staged.docPrefix, filename: saved.filename })
    await head(storageFilePath, { token: requireBlobToken('media') })
    await deleteStagedUpload(req, staged.pathname)
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Could not check whether a staged Media upload is in use' })
  }
  return result
}

export const showMediaSaveError: CollectionAfterErrorHook = async ({ error, req, result }) => {
  if (!result || (req.method !== 'POST' && req.method !== 'PATCH')) return

  const staged = stagedUploads.get(req)
  if (staged) {
    try {
      const { totalDocs } = await req.payload.count({
        collection: 'media',
        overrideAccess: true,
        where: { _objectKey: { equals: staged.objectKey } },
        req,
      })
      if (totalDocs === 0) await deleteStagedUpload(req, staged.pathname)
    } catch (err) {
      req.payload.logger.error({ err, msg: 'Could not check whether a staged Media upload is in use' })
    }
  }

  if (result.errors.some(({ data }) => Array.isArray(data?.errors) && data.errors.length > 0)) return
  const message = error instanceof FileUploadError
    ? 'The server could not read or convert this image. Check that it opens or export it as a JPEG and try again.'
    : (result.errors[0]?.message ?? 'Could not save this photo. Try again.')

  return { response: { ...result, errors: [{ message, data: { errors: [{ path: 'file', message }] } }] } }
}
