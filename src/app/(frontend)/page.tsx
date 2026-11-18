import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diamond & Co',
  robots: { index: false, follow: false },
}

export default function HomePage() {
  return (
    <main>
      <h1>Diamond &amp; Co</h1>
      <p>Our new website is on its way.</p>
    </main>
  )
}
