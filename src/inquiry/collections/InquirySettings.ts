import type { Field, GlobalConfig } from 'payload'

import { adminOnly, signedIn } from './access'

const choices = (name: string, label: string, defaults: [label: string, value: string][]): Field => ({
  name,
  label,
  type: 'array',
  defaultValue: defaults.map(([label, value]) => ({ label, value })),
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'value', type: 'text', required: true },
  ],
})

export const InquirySettings: GlobalConfig = {
  slug: 'inquiry-settings',
  access: {
    read: signedIn,
    update: adminOnly,
  },
  fields: [
    choices('pieceTypes', 'Piece types (/book)', [
      ['Engagement ring', 'engagement-ring'],
      ['Wedding band', 'wedding-band'],
      ['Redesign a piece I own', 'redesign'],
      ['Necklace or pendant', 'necklace-or-pendant'],
      ['Earrings', 'earrings'],
      ['Something else', 'something-else'],
    ]),
    choices('budgetRanges', 'Budget ranges, CAD (/book)', [
      ['Under $2,500', 'under-2500'],
      ['$2,500 to $5,000', '2500-to-5000'],
      ['$5,000 to $10,000', '5000-to-10000'],
      ['$10,000 to $20,000', '10000-to-20000'],
      ['Over $20,000', 'over-20000'],
      ['Not sure yet', 'not-sure'],
    ]),
  ],
}
