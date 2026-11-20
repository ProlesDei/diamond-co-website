import type { MetadataRoute } from 'next'

import { absoluteUrl, isProduction } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) return { rules: { userAgent: '*', disallow: '/' } }

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
