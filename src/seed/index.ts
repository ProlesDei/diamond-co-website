import type { Payload } from 'payload'

import { seedAdmin } from './admin'
import { seedFaqs } from './faqs'
import { seedInquirySettings } from './inquirySettings'
import { seedPieces } from './pieces'
import { seedSiteSettings } from './siteSettings'

// Each step adds only what is missing and returns a label for each thing it added.
export type SeedStep = {
  name: string
  run: (payload: Payload) => Promise<string[]>
}

export const seedSteps: SeedStep[] = [
  { name: 'admin user', run: seedAdmin },
  { name: 'site-settings', run: seedSiteSettings },
  { name: 'inquiry-settings', run: seedInquirySettings },
  { name: 'pieces', run: seedPieces },
  { name: 'faqs', run: seedFaqs },
]

export type SeedResult = { step: string; added: string[] }

export const runSeed = async (payload: Payload): Promise<SeedResult[]> => {
  const results: SeedResult[] = []
  for (const step of seedSteps) {
    results.push({ step: step.name, added: await step.run(payload) })
  }
  return results
}
