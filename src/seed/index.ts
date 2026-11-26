import type { Payload } from 'payload'

import { seedAdmin } from './admin'
import { hasNonSampleFaqs, seedFaqs } from './faqs'
import { seedPieces } from './pieces'
import { seedSiteSettings } from './siteSettings'

// Each step adds only what is missing and returns a label for each thing it added.
export type SeedStep = {
  name: string
  run: (payload: Payload) => Promise<string[]>
}

export const seedSteps: SeedStep[] = [
  { name: 'admin user', run: seedAdmin },
  { name: 'faqs', run: seedFaqs },
  { name: 'site-settings', run: seedSiteSettings },
  { name: 'pieces', run: seedPieces },
]

export type SeedResult = { step: string; added: string[] }

export const runSeed = async (payload: Payload): Promise<SeedResult[] | null> => {
  // Older FAQs have no sample key. Leave the database for editors to curate.
  if (await hasNonSampleFaqs(payload)) return null

  const results: SeedResult[] = []
  for (const step of seedSteps) {
    results.push({ step: step.name, added: await step.run(payload) })
  }
  return results
}
