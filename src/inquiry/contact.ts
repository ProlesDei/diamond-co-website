const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_SEPARATORS = /[\s\-.()]/g
const PHONE = /^\+?\d{7,15}$/

export function isEmailOrPhone(value: string): boolean {
  const text = value.trim()
  return EMAIL.test(text) || PHONE.test(text.replace(PHONE_SEPARATORS, ''))
}
