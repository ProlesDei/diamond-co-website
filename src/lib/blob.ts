export type BlobStore = 'media' | 'inquiry-uploads'

export const blobTokenVariables = {
  media: 'BLOB_READ_WRITE_TOKEN',
  'inquiry-uploads': 'INQUIRY_BLOB_READ_WRITE_TOKEN',
} as const satisfies Record<BlobStore, string>

export const blobTokenFallbackVariables: { readonly [store in BlobStore]?: string } = {
  // FALLBACK (Nov 19, 2026): Vercel's inquiries store connection sets INQUIRY_READ_WRITE_TOKEN; delete this to read INQUIRY_BLOB_READ_WRITE_TOKEN only.
  'inquiry-uploads': 'INQUIRY_READ_WRITE_TOKEN',
}

const READ_WRITE_TOKEN = /^vercel_blob_rw_[a-z\d]+_[a-z\d]+$/i

const tokenVariableNames = (store: BlobStore): string[] =>
  [blobTokenVariables[store], blobTokenFallbackVariables[store]].filter((name) => name !== undefined)

export function readBlobToken(store: BlobStore): string | undefined {
  const variable = tokenVariableNames(store).find((name) => process.env[name])
  const value = variable && process.env[variable]
  if (!variable || !value) return undefined
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
    throw new Error(`Set ${tokenVariableNames(store).join(' or ')} to the ${store} store's read-write token from Vercel.`)
  }
  return value
}
