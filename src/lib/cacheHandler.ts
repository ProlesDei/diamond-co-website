import { createRequire } from 'node:module'

import type NextFileSystemCache from 'next/dist/server/lib/incremental-cache/file-system-cache'

const requireCjs = createRequire(import.meta.url)
const FileSystemCache: typeof NextFileSystemCache = requireCjs(
  'next/dist/server/lib/incremental-cache/file-system-cache.js',
).default

const startedAt = Date.now()

// Next keeps revalidateTag's record in memory only, so an entry on disk from before a restart
// or a rebuild may predate a save this process never saw. Render each such entry again.
export default class CacheHandler extends FileSystemCache {
  async get(...args: Parameters<NextFileSystemCache['get']>) {
    const entry = await super.get(...args)
    return entry && entry.lastModified >= startedAt ? entry : null
  }
}
