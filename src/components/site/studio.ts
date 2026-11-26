import { getSiteSettings } from '@/lib/content'

type ContactLink = {
  text: string
  href: string
}

export type StudioContact = {
  phone: ContactLink | null
  email: ContactLink | null
}

export async function getStudioContact(): Promise<StudioContact> {
  const { phone, email } = await getSiteSettings()
  const phoneText = phone?.trim() ?? ''
  const number = phoneText.replace(/[().\s-]/g, '')
  const emailText = email?.trim() ?? ''

  return {
    phone: /^\+?\d{7,15}$/.test(number) ? { text: phoneText, href: `tel:${number}` } : null,
    email: /^[^\s@[\]]+@[^\s@[\]]+\.[^\s@[\]]+$/.test(emailText) && !/@example\.ca$/i.test(emailText)
      ? { text: emailText, href: `mailto:${emailText}` }
      : null,
  }
}

export const studio = {
  tagline: 'Private jewellers. Custom design only.',
  hours: [
    { days: 'Tuesday to Saturday', time: '10 am to 5 pm' },
    { days: 'Sunday and Monday', time: 'Closed' },
  ],
  appointment: { text: 'By appointment' },
} as const
