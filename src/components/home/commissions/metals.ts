import type { Piece } from '@/payload-types'

export type Metal = NonNullable<Piece['metals']>[number]

export const metalLooks: Record<Metal, { label: string; colour: string }> = {
  '14k-yellow-gold': { label: '14k yellow gold', colour: '#C8B07A' },
  '18k-yellow-gold': { label: '18k yellow gold', colour: '#C9A24D' },
  '22k-yellow-gold': { label: '22k yellow gold', colour: '#C79A2E' },
  '24k-yellow-gold': { label: '24k yellow gold', colour: '#D4A81F' },
  'rose-gold': { label: 'Rose gold', colour: '#C98F7B' },
  'white-gold': { label: 'White gold', colour: '#D9DBD8' },
  platinum: { label: 'Platinum', colour: '#D7DAD8' },
}
