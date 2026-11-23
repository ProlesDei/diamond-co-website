import type { Field, FieldAccess, GlobalConfig, TextFieldSingleValidation } from 'payload'

import { readCalendlyLink } from '@/lib/calendly'

import { isAdmin } from '../../content/access'
import { signedIn } from './access'

const adminOnlyField: FieldAccess = ({ req }) => isAdmin(req)

const choices = (name: string, label: string, defaults: [label: string, value: string][]): Field => ({
  name,
  label,
  type: 'array',
  // Editors may change the Calendly link; the choices stay with admins.
  access: { update: adminOnlyField },
  defaultValue: defaults.map(([label, value]) => ({ label, value })),
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'value', type: 'text', required: true },
  ],
})

const validateCalendlyLink: TextFieldSingleValidation = (value) =>
  !value ||
  readCalendlyLink(value) !== null ||
  'Use a Calendly event link that starts with https://calendly.com/, such as https://calendly.com/your-studio/consultation'

export const InquirySettings: GlobalConfig = {
  slug: 'inquiry-settings',
  access: {
    read: signedIn,
    update: signedIn,
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
    {
      name: 'calendlyLink',
      label: 'Calendly link (https://calendly.com/ only)',
      type: 'text',
      validate: validateCalendlyLink,
      admin: {
        description:
          'The Calendly event the booking forms open after a visitor sends the form. Leave it empty and the forms end by asking the visitor to call or email with their reference. A change shows on the next page load.',
      },
    },
  ],
}
