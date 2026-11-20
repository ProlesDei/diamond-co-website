import type { Payload } from 'payload'

import type { Piece } from '../payload-types'
import { seedContext } from './context'
import { drawPlaceholder } from './placeholder'
import { paragraphs } from './richText'

type SamplePiece = Pick<
  Piece,
  'title' | 'slug' | 'category' | 'metals' | 'stones' | 'setting' | 'featured' | 'startingFrom'
> & { story: string[] }

const IMAGES_PER_PIECE = 2

// Invented sample pieces: none is the client's work, and their images are placeholders.
const samplePieces: SamplePiece[] = [
  {
    title: 'Oval solitaire',
    slug: 'oval-solitaire',
    category: 'engagement-rings',
    metals: ['platinum'],
    stones: [{ type: 'Diamond', origin: 'natural', carat: 1.2, cut: 'Oval', colour: 'F' }],
    setting: 'Four-claw cathedral setting',
    featured: true,
    startingFrom: 6800,
    story: [
      'A single oval diamond held high on four fine claws, with a slim band that sits flush against a wedding ring.',
    ],
  },
  {
    title: 'Hidden-halo cushion',
    slug: 'hidden-halo-cushion',
    category: 'engagement-rings',
    metals: ['18k-yellow-gold'],
    stones: [
      { type: 'Diamond', origin: 'lab', carat: 1.5, cut: 'Cushion', colour: 'G' },
      { type: 'Diamond', origin: 'lab', carat: 0.2, cut: 'Round brilliant', colour: 'G' },
    ],
    setting: 'Hidden halo under the centre stone',
    featured: true,
    startingFrom: 4200,
    story: [
      'From the front it reads as a plain solitaire. Turn it and a ring of small diamonds catches the light under the centre stone.',
    ],
  },
  {
    title: 'Hand-forged comfort band',
    slug: 'hand-forged-comfort-band',
    category: 'wedding-bands',
    metals: ['18k-yellow-gold', 'white-gold'],
    stones: [],
    featured: false,
    startingFrom: 1400,
    story: [
      'Forged from a single bar, then rounded on the inside so it slides on easily and stays comfortable all day.',
    ],
  },
  {
    title: 'Bezel sapphire pendant',
    slug: 'bezel-sapphire-pendant',
    category: 'necklaces',
    metals: ['14k-yellow-gold'],
    stones: [{ type: 'Sapphire', origin: 'natural', carat: 0.9, cut: 'Round', colour: 'Blue' }],
    setting: 'Full bezel on a fine cable chain',
    featured: false,
    startingFrom: 1900,
    story: ['A blue sapphire wrapped in a smooth gold rim, made to be worn every day.'],
  },
  {
    title: 'Pear drop earrings',
    slug: 'pear-drop-earrings',
    category: 'earrings',
    metals: ['white-gold'],
    stones: [{ type: 'Diamond', origin: 'lab', carat: 0.5, cut: 'Pear', colour: 'F' }],
    setting: 'Three-claw drops on short hooks',
    featured: false,
    startingFrom: 2600,
    story: ['A matched pair of pear-cut diamonds that move as you turn your head.'],
  },
  {
    title: 'Grandmother’s ring, reset',
    slug: 'grandmothers-ring-reset',
    category: 'heirloom-redesign',
    metals: ['rose-gold'],
    stones: [{ type: 'Diamond', origin: 'natural', carat: 0.8, cut: 'Old European', colour: 'H' }],
    setting: 'Low six-claw setting on a new band',
    featured: true,
    startingFrom: 1800,
    story: [
      'An old European cut diamond from a worn family ring, measured and photographed before work began, then set again in rose gold.',
    ],
  },
]

// Reuses a placeholder with the same alt text, so a rerun after a failed one adds no copies.
const placeholderImage = async (payload: Payload, piece: SamplePiece, view: number): Promise<string> => {
  const alt = `Placeholder photo ${view} of ${IMAGES_PER_PIECE} of the sample piece ${piece.title}`
  const { docs } = await payload.find({
    collection: 'media',
    where: { and: [{ alt: { equals: alt } }, { source: { equals: 'placeholder' } }] },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  if (docs[0]) return docs[0].id

  const data = await drawPlaceholder(piece.title, view)
  const media = await payload.create({
    collection: 'media',
    data: { alt, source: 'placeholder', shot: 'daylight' },
    file: { data, mimetype: 'image/jpeg', name: `placeholder-${piece.slug}-${view}.jpg`, size: data.length },
    overrideAccess: true,
    context: seedContext,
  })
  return media.id
}

export const seedPieces = async (payload: Payload): Promise<string[]> => {
  const added: string[] = []
  for (const piece of samplePieces) {
    const { totalDocs } = await payload.count({
      collection: 'pieces',
      where: { slug: { equals: piece.slug } },
      overrideAccess: true,
    })
    if (totalDocs > 0) continue

    const gallery: string[] = []
    for (let view = 1; view <= IMAGES_PER_PIECE; view += 1) {
      gallery.push(await placeholderImage(payload, piece, view))
    }
    const { story, ...fields } = piece
    await payload.create({
      collection: 'pieces',
      data: { ...fields, story: paragraphs(...story), gallery, _status: 'published' },
      overrideAccess: true,
      context: seedContext,
    })
    added.push(`${piece.title} (${piece.category}, ${IMAGES_PER_PIECE} placeholder images)`)
  }
  return added
}
