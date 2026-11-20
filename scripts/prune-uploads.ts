import { getPayload } from 'payload'
import { parseArgs } from 'node:util'

import { pruneUnlinkedUploads } from '../src/inquiry/prune'
import { blobTokenFallbackVariables, blobTokenVariables } from '../src/lib/blob'
import config from '../src/payload.config'

const usage = 'usage: pnpm uploads:prune [--dry-run]'

let dryRun: boolean
try {
  dryRun = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false } } }).values['dry-run']
} catch (error) {
  console.error(`uploads:prune: ${(error as Error).message}\n${usage}`)
  process.exit(2)
}

if (process.env.SITE_ENV === 'production') {
  console.error(
    'uploads:prune: refused because SITE_ENV is production; it is a local and staging tool until the site goes live. Unset SITE_ENV to prune locally.',
  )
  process.exit(2)
}

const BLOB_MOCK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]'])
const blobApiUrl = process.env.VERCEL_BLOB_API_URL
const onBlobMock = blobApiUrl !== undefined && URL.canParse(blobApiUrl) && BLOB_MOCK_HOSTS.has(new URL(blobApiUrl).hostname)
const realStoreTokens = [...Object.values(blobTokenVariables), ...Object.values(blobTokenFallbackVariables)].filter(
  (variable) => process.env[variable],
)
if (realStoreTokens.length > 0 && !onBlobMock) {
  const names = realStoreTokens.join(' and ')
  console.error(
    `uploads:prune: refused because ${names} ${realStoreTokens.length > 1 ? 'are' : 'is'} set and VERCEL_BLOB_API_URL is not the blob mock, so the prune would reach a real Blob store; until the owner's call on pairing a store with its database, it runs only on the blob mock or on local files. Unset ${names} to prune the local files, or start tools/blob-mock and export the VERCEL_BLOB_API_URL it prints.`,
  )
  process.exit(2)
}

const payload = await getPayload({ config })
let failed = false
try {
  const { uploads, orphanBlobs } = await pruneUnlinkedUploads(payload, { dryRun })
  const done = dryRun ? 'would delete' : 'deleted'
  for (const { id, fileGone } of uploads) {
    if (fileGone) console.log(`upload ${id}: its file was already gone; ${done} the record`)
    else console.log(`upload ${id}: unlinked for over 24 hours; ${done} the record and its file`)
  }
  for (const pathname of orphanBlobs ?? []) console.log(`blob ${pathname}: no upload points at it; ${done} the blob`)
  const blobs = orphanBlobs ? ` and ${orphanBlobs.length} orphan blob(s)` : ''
  console.log(
    dryRun
      ? `Dry run: would delete ${uploads.length} unlinked upload(s)${blobs} older than 24 hours. Deleted nothing.`
      : `Deleted ${uploads.length} unlinked upload(s)${blobs} older than 24 hours.`,
  )
} catch (error) {
  console.error(`uploads:prune: ${(error as Error).message}`)
  failed = true
} finally {
  await payload.destroy()
}
process.exit(failed ? 1 : 0)
