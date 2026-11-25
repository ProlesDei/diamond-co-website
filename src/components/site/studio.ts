export type Marker = 'confirm' | 'client supplies'

export type Fact = {
  text: string
  marker: Marker
}

export type Contact = Fact & {
  href: string
}

export const studio = {
  tagline: 'Private jewellers. Custom design only.',
  hours: [
    { days: 'Tuesday to Saturday', time: '10 am to 5 pm', marker: 'confirm' },
    { days: 'Sunday and Monday', time: 'Closed', marker: 'confirm' },
  ],
  appointment: { text: 'By appointment', marker: 'confirm' },
  phone: { text: '[PHONE]', href: 'tel:+1', marker: 'client supplies' },
  email: { text: '[EMAIL]', href: 'mailto:hello@example.ca', marker: 'client supplies' },
} as const satisfies {
  tagline: string
  hours: readonly { days: string; time: string; marker: Marker }[]
  appointment: Fact
  phone: Contact
  email: Contact
}
