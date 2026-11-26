import type { GlobalConfig, TextFieldSingleValidation } from 'payload'

import { CALENDLY_PLACEHOLDER_LINK, readCalendlyLink } from '@/lib/calendly'

import { signedIn } from './access'

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
    {
      name: 'calendlyLink',
      label: 'Calendly link (https://calendly.com/ only)',
      type: 'text',
      validate: validateCalendlyLink,
      admin: {
        description: `The Calendly event every booking goes to after the visitor sends the form. Left empty, bookings go to the placeholder ${CALENDLY_PLACEHOLDER_LINK}, which is not a real event. A change shows on the next page load.`,
      },
    },
  ],
}
