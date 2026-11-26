import { TESTIMONIAL_SOURCE_LABELS } from '@/content/Testimonials'
import type { Testimonial } from '@/payload-types'

export type ShownTestimonial = {
  id: string
  name: string
  quote: string
  sourceLabel: string
  proof: { url: string; alt: string; width: number | null; height: number | null } | null
}

type TestimonialDoc = Pick<Testimonial, 'id' | 'firstName' | 'quote' | 'proof'> & { source?: Testimonial['source'] | null }

// Testimonials saved before the source field existed are personal ones.
export function toShownTestimonial({ id, firstName, quote, source, proof }: TestimonialDoc): ShownTestimonial {
  const shownProof = proof && typeof proof === 'object' && proof.url
    ? { url: proof.url, alt: proof.alt, width: proof.width ?? null, height: proof.height ?? null }
    : null
  return { id, name: firstName, quote, sourceLabel: TESTIMONIAL_SOURCE_LABELS[source ?? 'personal'], proof: shownProof }
}
