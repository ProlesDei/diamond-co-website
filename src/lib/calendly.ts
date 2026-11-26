// The booking link is the Calendly link field in the admin's Inquiry settings.
const CALENDLY_ORIGIN = 'https://calendly.com'

// PLACEHOLDER: not a real Diamond & Co event. Every booking goes here until the studio saves its own
// Calendly link in Inquiry settings.
export const CALENDLY_PLACEHOLDER_LINK = `${CALENDLY_ORIGIN}/diamond-co-placeholder/consultation`

// Only links on https://calendly.com with a path pass.
export const readCalendlyLink = (value: string | null | undefined): string | null => {
  if (!value?.startsWith(`${CALENDLY_ORIGIN}/`)) return null
  try {
    const url = new URL(value)
    return url.origin === CALENDLY_ORIGIN && url.pathname !== '/' ? url.href : null
  } catch {
    return null
  }
}

// An empty or invalid stored link gives the placeholder, so the form always ends on Calendly.
export const bookingLink = (stored: string | null | undefined): string =>
  readCalendlyLink(stored) ?? CALENDLY_PLACEHOLDER_LINK

// Calendly fills its form from the name and email query parameters.
export function calendlyPrefillUrl(link: string, prefill: { name: string; email: string }): string {
  const url = new URL(link)
  url.searchParams.set('name', prefill.name)
  url.searchParams.set('email', prefill.email)
  return url.href
}
