// PARKED (owner, Nov 20, 2026): the live site has no Turnstile keys until the domain work, so with both
// unset the spam check is off and the rate limits alone hold. Set both keys and redeploy to turn it back on.
const turnstileVariables = ['TURNSTILE_SECRET_KEY', 'NEXT_PUBLIC_TURNSTILE_SITE_KEY']

export function turnstileParked(): boolean {
  if (turnstileVariables.some((name) => process.env[name])) return false
  console.warn(`turnstile: ${turnstileVariables.join(' and ')} are both unset, so the check is parked and skipped.`)
  return true
}
