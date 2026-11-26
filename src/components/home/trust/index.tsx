import { getImageProps } from 'next/image'

import { mediaLoader } from '@/media/loader'

import { getTrustContent } from './content'
import styles from './Trust.module.css'

export async function Trust() {
  const { images, testimonials } = await getTrustContent()

  return (
    <section className={styles.section} aria-labelledby="trust-heading">
      <div className={styles.inner}>
        <div>
          <h2 className={styles.heading} id="trust-heading">
            Know what happens <em>at the bench.</em>
          </h2>
          <p className={styles.lede}>
            A custom piece takes about 2–4 weeks. If you have a proposal date in mind,
            share it when you book.
          </p>
        </div>
        <div className={styles.promises}>
          <div>
            <h3>The Render-First Promise</h3>
            <p>See your piece from every side and approve the render before we cut any metal.</p>
          </div>
        </div>
        {images.length > 0 && (
          <div className={styles.gallery}>
            {images.map(({ src, alt, width, height }) => {
              const { props } = getImageProps({
                src,
                alt,
                width,
                height,
                loader: mediaLoader,
                sizes: images.length === 1 ? '(max-width: 599px) 90vw, 480px' : '45vw',
                className: styles.photo,
              })
              // Use Next's generated image props with the CMS file sizes.
              // eslint-disable-next-line @next/next/no-img-element
              return <img key={src} {...props} alt={alt} />
            })}
          </div>
        )}
        {testimonials.length > 0 && (
          <div className={styles.testimonials}>
            <h3>From our clients</h3>
            <ul className={styles.quotes} role="list">
              {testimonials.map(({ id, quote, name, sourceLabel, proof }) => (
                <li key={id}>
                  <figure>
                    <blockquote>{quote}</blockquote>
                    <figcaption>
                      {name}
                      <span className={styles.source}>{sourceLabel}</span>
                    </figcaption>
                  </figure>
                  {proof && (
                    <a className={styles.proof} href={proof.url}>
                      {/* A screenshot at its own size: Next's optimizer needs widths these files don't have. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proof.url}
                        alt={proof.alt}
                        width={proof.width ?? undefined}
                        height={proof.height ?? undefined}
                        loading="lazy"
                      />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
