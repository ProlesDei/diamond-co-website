import { resolveSignedURLKey } from '@payloadcms/plugin-cloud-storage/utilities'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { APIError } from 'payload'
import type { CollectionConfig, GlobalConfig, PayloadHandler, Plugin } from 'payload'

import { readBlobToken } from '@/lib/blob'

import { freeUploadFileName, isPublicUploadSlug } from './fileName'
import { Media } from './Media'
import { TestimonialProofs } from './TestimonialProofs'

const CLIENT_UPLOAD_ROUTE = '/vercel-blob-client-upload-route'

type ClientUploadRequest = { collectionSlug: string; docPrefix?: string; filename: string }

const issueNewKeyWithFreeName =
  (handler: PayloadHandler): PayloadHandler =>
  async (req) => {
    if (req.searchParams.get('issue-client-upload') !== '1') return handler(req)
    if (!req.clone) throw new APIError('This upload request cannot be read. Upload the photo again.', 400)

    const requestCopy = req.clone()
    await handler(req)

    const { collectionSlug, docPrefix, filename } = (await requestCopy.json()) as ClientUploadRequest
    if (!isPublicUploadSlug(collectionSlug)) throw new APIError('This collection takes no uploads here.', 400)
    const fresh = await resolveSignedURLKey({
      collectionSlug,
      docPrefix,
      filename: await freeUploadFileName(req, collectionSlug, filename),
      req,
    })
    return Response.json({
      clientUploadContext: fresh.clientUploadContext,
      filename: fresh.sanitizedFilename,
      pathname: fresh.storageFilePath,
    })
  }

const neverOverwriteOnClientUpload: Plugin = (config) => {
  if (!config.endpoints?.some((endpoint) => endpoint.path === CLIENT_UPLOAD_ROUTE)) {
    throw new Error(`The Vercel Blob plugin has no ${CLIENT_UPLOAD_ROUTE} endpoint to guard against overwrites.`)
  }
  return {
    ...config,
    endpoints: config.endpoints.map((endpoint) =>
      endpoint.path === CLIENT_UPLOAD_ROUTE
        ? { ...endpoint, handler: issueNewKeyWithFreeName(endpoint.handler) }
        : endpoint,
    ),
  }
}

const token = readBlobToken('media')

export const collections: CollectionConfig[] = [Media, TestimonialProofs]
export const globals: GlobalConfig[] = []
export const plugins: Plugin[] = [
  vercelBlobStorage({
    collections: { media: true, 'testimonial-proofs': { prefix: 'testimonial-proofs' } },
    token,
    clientUploads: true,
  }),
  ...(token ? [neverOverwriteOnClientUpload] : []),
]
