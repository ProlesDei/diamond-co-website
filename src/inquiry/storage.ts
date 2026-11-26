import { del, get, put } from '@vercel/blob'
import { openAsBlob } from 'node:fs'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  Plugin,
  UploadConfig,
} from 'payload'

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

// Each collection keeps its files under its own slug in the private store.
const pathIn = (slug: string, filename: string): string => `${slug}/${filename}`

const putFile =
  (token: string, slug: string): CollectionBeforeChangeHook =>
  async ({ data, req }) => {
    const file = req.file
    if (!file || typeof data.filename !== 'string') return data
    const body = file.tempFilePath ? await openAsBlob(file.tempFilePath) : file.data
    await put(pathIn(slug, data.filename), body, {
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
  (token: string, slug: string): CollectionAfterDeleteHook =>
  async ({ doc }) => {
    if (typeof doc.filename === 'string') await del(pathIn(slug, doc.filename), { abortSignal: abortAfterTimeout(), token })
    return doc
  }

// A new file on an existing record leaves the old one unused, and the store never overwrites, so delete it.
const deleteReplacedFile =
  (token: string, slug: string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, operation }) => {
    const old = previousDoc?.filename
    if (operation === 'update' && typeof old === 'string' && old !== doc.filename) {
      await del(pathIn(slug, old), { abortSignal: abortAfterTimeout(), token })
    }
    return doc
  }

// Payload runs the collection's read access before this handler, and no shared cache may keep the file.
const serveFile =
  (token: string, slug: string): NonNullable<UploadConfig['handlers']>[number] =>
  async (_req, { params: { filename } }) => {
    const blob = await get(pathIn(slug, encodeURIComponent(filename)), { access: ACCESS, token, useCache: false })
    if (!blob || blob.statusCode !== 200) return new Response(null, { status: 404 })
    return new Response(blob.stream, {
      headers: {
        'Content-Type': blob.blob.contentType,
        'Content-Length': String(blob.blob.size),
        'Cache-Control': 'private, no-store',
      },
    })
  }

const storeInBlob =
  (token: string, slug: string) =>
  (collection: CollectionConfig): CollectionConfig => {
    if (collection.slug !== slug || typeof collection.upload !== 'object') return collection
    return {
      ...collection,
      hooks: {
        ...collection.hooks,
        beforeChange: [...(collection.hooks?.beforeChange ?? []), putFile(token, slug)],
        afterChange: [...(collection.hooks?.afterChange ?? []), deleteReplacedFile(token, slug)],
        afterDelete: [...(collection.hooks?.afterDelete ?? []), deleteFile(token, slug)],
      },
      upload: {
        ...collection.upload,
        disableLocalStorage: true,
        handlers: [...(collection.upload.handlers ?? []), serveFile(token, slug)],
      },
    }
  }

// Keeps a collection's files in the private inquiry Blob store, served only through Payload's file route.
export const privateUploadStorage =
  (slug: string): Plugin =>
  (config) => {
    const token = isProduction ? requireBlobToken(STORE) : readBlobToken(STORE)
    if (!token) return config
    return { ...config, collections: config.collections?.map(storeInBlob(token, slug)) }
  }

export const inquiryUploadStorage: Plugin = privateUploadStorage(STORE)
