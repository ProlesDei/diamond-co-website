import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'

import { metalLooks } from '@/components/home/commissions/metals'
import { MetalSwatch } from '@/components/home/commissions/MetalSwatch'
import { Button } from '@/components/site/Button'
import { links } from '@/components/site/nav'
import { getGoldsmithName } from '@/lib/content'
import type { Piece } from '@/payload-types'

import { Confirm } from '../Confirm'
import { categoryName, stoneLines } from './materials'
import styles from './Piece.module.css'

// An editor who clears the story leaves an empty paragraph behind, so look for text, not for nodes.
const hasText = (node: unknown): boolean => {
  if (typeof node !== 'object' || node === null) return false
  if ('text' in node && typeof node.text === 'string' && node.text.trim() !== '') return true
  return 'children' in node && Array.isArray(node.children) && node.children.some(hasText)
}

export async function Words({ piece }: { piece: Piece }) {
  const goldsmithName = await getGoldsmithName()
  const metals = piece.metals ?? []
  const stones = stoneLines(piece)
  const { story } = piece

  return (
    <div>
      <p className={styles.eyebrow}>{categoryName[piece.category]}</p>
      <h1 className={styles.name}>{piece.title}</h1>
      {(metals.length > 0 || stones.length > 0 || piece.setting) && (
        <dl className={styles.materials}>
          {metals.length > 0 && (
            <div>
              <dt>Metal</dt>
              <dd>
                {metals.map((metal) => (
                  <span key={metal} className={styles.line}>
                    <MetalSwatch metal={metal} />
                    {metalLooks[metal].label}
                    {metal === 'platinum' ? <Confirm /> : null}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {stones.length > 0 && (
            <div>
              <dt>Stone</dt>
              <dd>
                {stones.map((stone, index) => (
                  <span key={index} className={styles.line}>
                    {stone}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {piece.setting && (
            <div>
              <dt>Setting</dt>
              <dd>{piece.setting}</dd>
            </div>
          )}
        </dl>
      )}
      {story && hasText(story.root) && (
        <div className={styles.story}>
          <RichText data={story} disableContainer />
        </div>
      )}
      <div className={styles.cta}>
        <Button
          id="piece-book"
          variant="primary"
          href={`/book?piece=${encodeURIComponent(piece.slug)}`}
          className={styles.book}
        >
          Book a free consultation
        </Button>
        <p className={styles.micro}>
          Your request will name this piece, so {goldsmithName ?? 'the goldsmith'} has it in front of
          them. Pick a time online.
        </p>
        <Link href={links.catalog} className={styles.all}>
          See the whole catalog
        </Link>
      </div>
    </div>
  )
}
