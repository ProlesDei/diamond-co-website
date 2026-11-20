'use client'

import Image from 'next/image'
import { type UIEvent, useState } from 'react'

import { useReducedMotion } from '@/components/site/useReducedMotion'
import { mediaLoader } from '@/media/loader'

import styles from './Gallery.module.css'
import type { PiecePhoto } from './photos'
import { Zoom } from './zoom/Zoom'

type GalleryProps = { title: string; photos: (PiecePhoto | null)[] }

const join = (...names: (string | false)[]) => names.filter(Boolean).join(' ')

export function Gallery({ title, photos }: GalleryProps) {
  const [current, setCurrent] = useState(0)
  const [zoom, setZoom] = useState<{ at: number; opener: HTMLButtonElement } | null>(null)
  const reduceMotion = useReducedMotion()
  const total = photos.length
  const many = total > 1
  const zoomable = photos.filter((photo) => photo !== null)

  function closeZoom() {
    zoom?.opener.focus()
    setZoom(null)
  }

  // On a phone the browser's scroll snap does the swiping; this only reads where it landed.
  const onScroll = ({ currentTarget }: UIEvent<HTMLDivElement>) =>
    setCurrent(Math.round(currentTarget.scrollLeft / currentTarget.clientWidth))

  return (
    <div className={styles.gallery}>
      <div className={styles.bar}>
        <div className={styles.track} onScroll={onScroll}>
          {photos.map((photo, index) => (
            <figure
              key={index}
              className={join(
                styles.slide,
                index === current && styles.on,
                reduceMotion && styles.still,
              )}
            >
              <div className={join(styles.plate, photo?.shot === 'daylight' && styles.day)}>
                {photo ? (
                  <>
                    <Image
                      loader={mediaLoader}
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="(max-width: 899px) 100vw, 50vw"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    <button
                      type="button"
                      className={styles.zoom}
                      aria-label={`Zoom photo ${index + 1} of ${total}`}
                      onClick={(event) =>
                        setZoom({ at: zoomable.indexOf(photo), opener: event.currentTarget })
                      }
                    >
                      <span className={styles.tag} aria-hidden="true">
                        Zoom
                      </span>
                    </button>
                  </>
                ) : (
                  <span className={styles.placeholder}>Placeholder: photo of {title}</span>
                )}
              </div>
            </figure>
          ))}
        </div>
        {many && (
          <p className={styles.count} aria-hidden="true">
            {current + 1} of {total}
          </p>
        )}
      </div>
      {many && (
        <>
          <ul className={styles.dots} aria-hidden="true">
            {photos.map((_, index) => (
              <li key={index} className={index === current ? styles.dotOn : undefined} />
            ))}
          </ul>
          <ul className={styles.thumbs} aria-label="Photos of this piece">
            {photos.map((photo, index) => (
              <li key={index}>
                <button
                  type="button"
                  className={join(styles.thumb, photo?.shot === 'daylight' && styles.day)}
                  aria-label={`Show photo ${index + 1} of ${total}`}
                  aria-current={index === current}
                  onClick={() => setCurrent(index)}
                >
                  {photo ? (
                    <Image
                      loader={mediaLoader}
                      src={photo.src}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      sizes="72px"
                    />
                  ) : (
                    'Placeholder'
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {zoom && (
        <Zoom photos={zoomable} start={zoom.at} opener={zoom.opener} onClose={closeZoom} />
      )}
    </div>
  )
}
