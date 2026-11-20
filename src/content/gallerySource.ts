import type { CollectionBeforeChangeHook, Plugin } from 'payload'
import { ValidationError } from 'payload'

import type { Media } from '../payload-types'

const TITLES_NAMED = 3

const refusedSource = (source: Media['source'] | undefined): boolean =>
  source === 'atmosphere' || (source === 'placeholder' && process.env.SITE_ENV === 'production')

const checkPublishedGalleries: CollectionBeforeChangeHook<Media> = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || !originalDoc) return data
  if (data.source === originalDoc.source || !refusedSource(data.source)) return data

  const { docs, totalDocs } = await req.payload.find({
    collection: 'pieces',
    where: {
      and: [{ gallery: { in: [originalDoc.id] } }, { _status: { equals: 'published' } }],
    },
    draft: false,
    depth: 0,
    limit: TITLES_NAMED,
    select: { title: true },
    req,
  })
  if (totalDocs === 0) return data

  const titles = docs.map((piece) => `“${piece.title}”`).join(', ')
  const more = totalDocs > docs.length ? ` and ${totalDocs - docs.length} more` : ''
  const kind = data.source === 'atmosphere' ? 'an atmosphere (generated) image' : 'a placeholder (sample) image'
  throw new ValidationError({
    collection: 'media',
    errors: [
      {
        path: 'source',
        message: `This photo is in the gallery of the published piece ${titles}${more}, so it can’t become ${kind}. Remove it from that gallery first.`,
      },
    ],
    req,
  })
}

export const gallerySource: Plugin = (config) => {
  const collections = config.collections ?? []
  if (!collections.some((collection) => collection.slug === 'media')) {
    throw new Error('gallerySource needs the media collection. Add src/media to the registries in payload.config.ts.')
  }
  return {
    ...config,
    collections: collections.map((collection) =>
      collection.slug === 'media'
        ? {
            ...collection,
            hooks: {
              ...collection.hooks,
              beforeChange: [...(collection.hooks?.beforeChange ?? []), checkPublishedGalleries],
            },
          }
        : collection,
    ),
  }
}
