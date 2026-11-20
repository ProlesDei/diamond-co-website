import type { MetadataRoute } from 'next'

import { getPublishedPieces } from '@/lib/content'
import { routes } from '@/lib/routes'
import { absoluteUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pieces = await getPublishedPieces()

  return [
    ...routes.map((route) => ({ url: absoluteUrl(route) })),
    ...pieces.map((piece) => ({
      url: absoluteUrl(`/commissions/${encodeURIComponent(piece.slug)}`),
      lastModified: piece.updatedAt,
    })),
  ]
}
