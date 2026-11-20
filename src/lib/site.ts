export const isProduction = process.env.SITE_ENV === 'production'

const readSiteUrl = (): string => {
  const value = process.env.SITE_URL
  if (!value) {
    if (isProduction) throw new Error('Set SITE_URL to the site’s address, such as https://example.com.')
    return 'http://localhost:3000'
  }
  const url = new URL(value)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('SITE_URL must start with https:// or http://.')
  }
  return url.origin
}

export const siteUrl = readSiteUrl()

export const absoluteUrl = (path: string): string => new URL(path, siteUrl).href
