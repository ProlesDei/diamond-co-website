import { del, get, put } from '@vercel/blob'
import { openAsBlob } from 'node:fs'
import type { CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionConfig, Plugin, UploadConfig } from 'payload'

import { readBlobToken, requireBlobToken } from '../lib/blob'
import { isProduction } from '../lib/site'

const STORE = 'inquiry-uploads'
const ACCESS = 'private'
const STORE_TIMEOUT_MS = 30_000

export const abortAfterTimeout = (): AbortSignal => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), STORE_TIMEOUT_MS).unref()
  return controller.signal
}

export const INQUIRY_BLOB_PREFIX = `${STORE}/`

export const pathnameOf = (filename: string): string => `${INQUIRY_BLOB_PREFIX}${filename}`

const putFile =
  (token: string): CollectionBeforeChangeHook =>
  async ({ data, req }) => {
    const file = req.file
    if (!file || typeof data.filename !== 'string') return data
    const body = file.tempFilePath ? await openAsBlob(file.tempFilePath) : file.data
    await put(pathnameOf(data.filename), body, {
      abortSignal: abortAfterTimeout(),
      access: ACCESS,
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: typeof data.mimeType === 'string' ? data.mimeType : file.mimetype,
      token,
    })
    return data
  }

const deleteFile =
  (token: string): CollectionAfterDeleteHook =>
  async ({ doc }) => {
    if (typeof doc.filename === 'string') await del(pathnameOf(doc.filename), { abortSignal: abortAfterTimeout(), token })
    return doc
  }

const serveFile =
  (token: string): NonNullable<UploadConfig['handlers']>[number] =>
  async (_req, { params: { filename } }) => {
    const blob = await get(pathnameOf(encodeURIComponent(filename)), { access: ACCESS, token, useCache: false })
    if (!blob || blob.statusCode !== 200) return new Response(null, { status: 404 })
    return new Response(blob.stream, {
      headers: { 'Content-Type': blob.blob.contentType, 'Content-Length': String(blob.blob.size) },
    })
  }

const storeInBlob =
  (token: string) =>
  (collection: CollectionConfig): CollectionConfig => {
    if (collection.slug !== STORE || typeof collection.upload !== 'object') return collection
    return {
      ...collection,
      hooks: {
        ...collection.hooks,
        beforeChange: [...(collection.hooks?.beforeChange ?? []), putFile(token)],
        afterDelete: [...(collection.hooks?.afterDelete ?? []), deleteFile(token)],
      },
      upload: {
        ...collection.upload,
        disableLocalStorage: true,
        handlers: [...(collection.upload.handlers ?? []), serveFile(token)],
      },
    }
  }

export const inquiryUploadStorage: Plugin = (config) => {
  const token = isProduction ? requireBlobToken(STORE) : readBlobToken(STORE)
  if (!token) return config
  return { ...config, collections: config.collections?.map(storeInBlob(token)) }
}
