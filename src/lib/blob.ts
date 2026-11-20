export type BlobStore = 'media' | 'inquiry-uploads'

export const blobTokenVariables = {
  media: 'BLOB_READ_WRITE_TOKEN',
  'inquiry-uploads': 'INQUIRY_BLOB_READ_WRITE_TOKEN',
} as const satisfies Record<BlobStore, string>

const READ_WRITE_TOKEN = /^vercel_blob_rw_[a-z\d]+_[a-z\d]+$/i

export function readBlobToken(store: BlobStore): string | undefined {
  const variable = blobTokenVariables[store]
  const value = process.env[variable]
  if (!value) return undefined
  if (!READ_WRITE_TOKEN.test(value)) {
    throw new Error(
      `${variable} is not a Vercel Blob read-write token (vercel_blob_rw_<store>_<random>). Copy it again from the ${store} store's settings in Vercel.`,
    )
  }
  return value
}

export function requireBlobToken(store: BlobStore): string {
  const value = readBlobToken(store)
  if (!value) {
    throw new Error(`Set ${blobTokenVariables[store]} to the ${store} store's read-write token from Vercel.`)
  }
  return value
}
