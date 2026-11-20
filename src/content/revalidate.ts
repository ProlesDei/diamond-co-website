import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

const revalidate = (req: PayloadRequest, tags: string[]): void => {
  if (req.context.disableRevalidate) return
  for (const tag of new Set(tags)) {
    revalidateTag(tag, { expire: 0 })
    req.payload.logger.info(`revalidateTag ${tag}`)
  }
}

type Tagged = { id: string | number; _status?: 'draft' | 'published' | null; slug?: string | null }

export const revalidateAfterChange =
  (tags: (doc: Tagged) => string[]): CollectionAfterChangeHook<Tagged> =>
  ({ doc, previousDoc, req }) => {
    if (doc._status === 'published') revalidate(req, tags(doc))
    if (previousDoc?._status === 'published') revalidate(req, tags(previousDoc))
    return doc
  }

export const revalidateAfterDelete =
  (tags: (doc: Tagged) => string[]): CollectionAfterDeleteHook<Tagged> =>
  ({ doc, req }) => {
    revalidate(req, tags(doc))
    return doc
  }

export const revalidateGlobalAfterChange =
  (tag: string): GlobalAfterChangeHook =>
  ({ doc, req }) => {
    revalidate(req, [tag])
    return doc
  }
