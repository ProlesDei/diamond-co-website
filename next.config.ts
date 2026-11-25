import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const productionVariables = [
  'DATABASE_URL',
  'SITE_URL',
  'PAYLOAD_SECRET',
  'BLOB_READ_WRITE_TOKEN',
  'INQUIRY_BLOB_READ_WRITE_TOKEN',
]

const fallbackVariables: Record<string, string> = {
  // FALLBACK (Nov 19, 2026): Vercel's MongoDB add-on sets MONGODB_URI; delete this to read DATABASE_URL only.
  DATABASE_URL: 'MONGODB_URI',
  // FALLBACK (Nov 19, 2026): Vercel's inquiries store connection sets INQUIRY_READ_WRITE_TOKEN; delete this to read INQUIRY_BLOB_READ_WRITE_TOKEN only.
  INQUIRY_BLOB_READ_WRITE_TOKEN: 'INQUIRY_READ_WRITE_TOKEN',
}

// PARKED (owner, Nov 19, 2026): online booking and email are off for the .vercel.app run, so these
// only warn when unset. Move them back into productionVariables to turn the refusal back on.
const parkedVariables = [
  'TURNSTILE_SECRET_KEY',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'RESEND_API_KEY',
  'EMAIL_FROM_ADDRESS',
  'EMAIL_FROM_NAME',
]

if (process.env.SITE_ENV === 'production') {
  for (const name of parkedVariables.filter((name) => !process.env[name])) {
    console.warn(`SITE_ENV is production and ${name} is unset; it is parked, so the build goes on.`)
  }
  const missing = productionVariables.filter(
    (name) => !process.env[name] && !(name in fallbackVariables && process.env[fallbackVariables[name]]),
  )
  if (missing.length > 0) {
    console.error(
      `SITE_ENV is production, so these variables must be set: ${missing.join(', ')}. Set each one, or unset SITE_ENV to run locally.`,
    )
    process.exit(2)
  }
}

const turnstile = 'https://challenges.cloudflare.com'
const calendly = 'https://calendly.com'

const readBlobApiOrigin = (): string => {
  const value = process.env.NEXT_PUBLIC_VERCEL_BLOB_API_URL
  if (!value) return 'https://vercel.com'
  try {
    return new URL(value).origin
  } catch {
    throw new Error('NEXT_PUBLIC_VERCEL_BLOB_API_URL must be a URL, such as https://vercel.com/api/blob, or unset.')
  }
}
const blobApi = readBlobApiOrigin()

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${turnstile}${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${turnstile} ${blobApi}`,
  `frame-src ${turnstile} ${calendly}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(process.env.SITE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000' }]
    : []),
]

const nextConfig: NextConfig = {
  agentRules: false,
  ...(process.env.VERCEL === '1' ? {} : { cacheHandler: path.resolve(dirname, 'src/lib/cacheHandler.ts') }),
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
