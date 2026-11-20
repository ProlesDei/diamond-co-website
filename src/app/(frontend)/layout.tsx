import type { Metadata } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'

import { Footer } from '@/components/site/Footer'
import { SiteHeader } from '@/components/site/SiteHeader'
import { getSiteSettings } from '@/lib/content'
import { isProduction } from '@/lib/site'
import { storeJsonLd } from '@/lib/storeJsonLd'
import '@/styles/tokens.css'
import '@/styles/base.css'

const bodoniModa = localFont({
  src: [
    { path: './fonts/BodoniModa.ttf', weight: '400 900', style: 'normal' },
    { path: './fonts/BodoniModa-Italic.ttf', weight: '400 900', style: 'italic' },
  ],
  display: 'block',
  variable: '--font-display',
  fallback: ['Didot', 'Georgia', 'serif'],
})

const jost = localFont({
  src: './fonts/Jost.ttf',
  weight: '100 900',
  style: 'normal',
  display: 'block',
  variable: '--font-sans',
  fallback: ['Avenir Next', 'Century Gothic', 'system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  title: { default: 'Diamond & Co.', template: '%s · Diamond & Co.' },
  robots: isProduction ? undefined : { index: false },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="en" className={`${bodoniModa.variable} ${jost.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: storeJsonLd(settings) }} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
