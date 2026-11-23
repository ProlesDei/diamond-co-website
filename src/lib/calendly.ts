// The booking link is the Calendly link field in the admin's Inquiry settings.
// Empty, or not a Calendly link, the forms keep their send-and-reply ending and show no time step.
// The prefill's a1 fills the event's first invitee question, so keep that question a free-text one.
const CALENDLY_ORIGIN = 'https://calendly.com'

// Only links on https://calendly.com with a path pass, so the iframe stays inside the CSP's frame-src.
export const readCalendlyLink = (value: string | null | undefined): string | null => {
  if (!value?.startsWith(`${CALENDLY_ORIGIN}/`)) return null
  try {
    const url = new URL(value)
    return url.origin === CALENDLY_ORIGIN && url.pathname !== '/' ? url.href : null
  } catch {
    return null
  }
}

export const calendlyOrigin = CALENDLY_ORIGIN
