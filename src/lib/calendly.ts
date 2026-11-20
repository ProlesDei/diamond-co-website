// The booking link comes from NEXT_PUBLIC_CALENDLY_URL only, set on Vercel for Preview and Development only for now.
// Unset, or not a Calendly link, the forms keep their send-and-reply ending and show no time step.
// The prefill's a1 fills the event's first invitee question, so keep that question a free-text one.
const CALENDLY_ORIGIN = 'https://calendly.com'

const readCalendlyUrl = (value: string | undefined): string | null => {
  if (!value?.startsWith(`${CALENDLY_ORIGIN}/`)) return null
  try {
    const url = new URL(value)
    return url.origin === CALENDLY_ORIGIN ? url.href : null
  } catch {
    return null
  }
}

export const calendlyOrigin = CALENDLY_ORIGIN

export const calendlyUrl: string | null = readCalendlyUrl(process.env.NEXT_PUBLIC_CALENDLY_URL)
