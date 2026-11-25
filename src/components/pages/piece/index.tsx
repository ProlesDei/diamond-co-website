import Link from 'next/link'
import { notFound } from 'next/navigation'

import { links } from '@/components/site/nav'
import { getPublishedPieces } from '@/lib/content'

import { pageMetadata } from '../metadata'
import { BookingBar } from './booking-bar'
import { Gallery } from './Gallery'
import { getPiece } from './getPiece'
import { More } from './more'
import { piecePhotos } from './photos'
import styles from './Piece.module.css'
import { Words } from './Words'

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const pieces = await getPublishedPieces()
  return pieces.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/catalog/[slug]'>) {
  const { slug } = await params
  const piece = await getPiece(slug)
  return pageMetadata(piece?.title ?? 'Page not found')
}

export default async function PiecePage({ params }: PageProps<'/catalog/[slug]'>) {
  const { slug } = await params
  const piece = await getPiece(slug)
  if (!piece) notFound()

  return (
    <>
      <div className={styles.back}>
        <Link href={links.catalog} className={styles.crumb}>
          Catalog
        </Link>
      </div>
      <div className={styles.layout}>
        <Gallery title={piece.title} photos={piecePhotos(piece)} />
        <Words piece={piece} />
      </div>
      <More />
      <BookingBar />
    </>
  )
}
