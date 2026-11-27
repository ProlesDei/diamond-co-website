import { buildUploadStoragePathData } from '@payloadcms/plugin-cloud-storage/utilities'
import { del } from '@vercel/blob'
import { CLIENT_UPLOAD_CONTEXT_CONTEXT_KEY, FileUploadError } from 'payload'
import type {
  CollectionAfterErrorHook,
  CollectionAfterOperationHook,
  CollectionBeforeOperationHook,
  PayloadRequest,
} from 'payload'

import { requireBlobToken } from '@/lib/blob'

type StagedUpload = { objectKey: string; filename: string; pathname: string }
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
  const { storageFilePath: pathname } = buildUploadStoragePathData({
    docPrefix: [prefix, objectKey].filter(Boolean).join('/'),
    filename,
  })
  stagedUploads.set(req, { filename, objectKey, pathname })
}

const deleteStagedUpload = async (req: PayloadRequest, pathname: string) => {
  try {
    await del(pathname, { token: requireBlobToken('media') })
  } catch (err) {
    req.payload.logger.error({ err, msg: 'Could not remove a staged Media upload' })
  }
}

export const removeReplacedStagingFile: CollectionAfterOperationHook<'media'> = async ({ operation, result, req }) => {
  if (req.context.skipCloudStorage || (operation !== 'create' && operation !== 'updateByID')) return result
  const staged = stagedUploads.get(req)
  if (!staged || !result?.id) return result

  // Read the saved docs instead of `result`, which holds only the fields the caller selected.
  // A retry with the same receipt shares the object key with an earlier save, so delete the
  // staged file only when no saved doc under that key still uses its name.
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
    const renamed = docs.some((doc) => doc.id === result.id && doc.filename && doc.filename !== staged.filename)
    if (renamed && docs.every((doc) => doc.filename !== staged.filename)) {
      await deleteStagedUpload(req, staged.pathname)
    }
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
