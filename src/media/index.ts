import { resolveSignedURLKey } from '@payloadcms/plugin-cloud-storage/utilities'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { APIError } from 'payload'
import type { CollectionConfig, GlobalConfig, PayloadHandler, Plugin } from 'payload'

import { readBlobToken } from '@/lib/blob'

import { freeMediaFileName } from './fileName'
import { Media } from './Media'

const CLIENT_UPLOAD_ROUTE = '/vercel-blob-client-upload-route'
const BLOB_PROVIDER = '@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler'

type ClientUploadRequest = { collectionSlug: string; docPrefix?: string; filename: string }

const issueNewKeyWithFreeName =
  (handler: PayloadHandler): PayloadHandler =>
  async (req) => {
    if (req.searchParams.get('issue-client-upload') !== '1') return handler(req)
    if (!req.clone) throw new APIError('This upload request cannot be read. Upload the photo again.', 400)

    const requestCopy = req.clone()
    await handler(req)

    const { collectionSlug, docPrefix, filename } = (await requestCopy.json()) as ClientUploadRequest
    const fresh = await resolveSignedURLKey({
      collectionSlug,
      docPrefix,
      filename: await freeMediaFileName(req, filename),
      req,
    })
    return Response.json({
      clientUploadContext: fresh.clientUploadContext,
      filename: fresh.sanitizedFilename,
      pathname: fresh.storageFilePath,
    })
  }

const guardMediaClientUploads: Plugin = (config) => {
  if (!config.endpoints?.some((endpoint) => endpoint.path === CLIENT_UPLOAD_ROUTE)) {
    throw new Error(`The Vercel Blob plugin has no ${CLIENT_UPLOAD_ROUTE} endpoint to guard against overwrites.`)
  }
  return {
    ...config,
    admin: {
      ...config.admin,
      components: {
        ...config.admin?.components,
        providers: config.admin?.components?.providers?.map((provider) =>
          typeof provider === 'object' && provider.path === BLOB_PROVIDER &&
          provider.clientProps && 'collectionSlug' in provider.clientProps && provider.clientProps.collectionSlug === 'media'
            ? { ...provider, path: '/media/MediaBlobUploads#MediaBlobUploads' }
            : provider,
        ),
      },
    },
    endpoints: config.endpoints.map((endpoint) =>
      endpoint.path === CLIENT_UPLOAD_ROUTE
        ? { ...endpoint, handler: issueNewKeyWithFreeName(endpoint.handler) }
        : endpoint,
    ),
  }
}

const token = readBlobToken('media')

export const collections: CollectionConfig[] = [Media]
export const globals: GlobalConfig[] = []
export const plugins: Plugin[] = [
  vercelBlobStorage({
    collections: { media: true },
    token,
    clientUploads: true,
  }),
  ...(token ? [guardMediaClientUploads] : []),
]
