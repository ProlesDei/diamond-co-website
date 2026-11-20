import type { RequestContext } from 'payload'

// The seed runs outside Next.js, where its cache can't be revalidated.
export const seedContext: RequestContext = { disableRevalidate: true }
