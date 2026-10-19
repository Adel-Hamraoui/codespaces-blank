import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { imageFor } from '@/frontend/assets/images'
import { ServiceIcon } from '@/frontend/components/ui/ServiceIcon'
import type { ServiceSummary } from '@/shared/types/content'
import styles from './ServiceCards.module.css'

/** Grille des prestations : prestations principales avec photo, puis prestations complémentaires. */
export function ServiceCards({ services, headingLevel = 'h3' }: { services: ServiceSummary[]; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  const featured = services.filter((s) => s.featured)
  const others = services.filter((s) => !s.featured)
  return (
    <div className={styles.wrap}>
      <ul className={styles.featured}>
        {featured.map((s, i) => {
          const image = imageFor(s.imageKey)
          return (
            <li key={s.slug} className={`${styles.card} ${i === 0 ? styles.wide : ''}`}>
              {image && (
                <div className={styles.media}>
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={styles.img}
                    placeholder="blur"
                  />
                </div>
              )}
              <div className={styles.body}>
                <span className={styles.icon}>
                  <ServiceIcon name={s.icon} />
                </span>
                <H className={styles.title}>
                  <Link href={`/prestations/${s.slug}`} className={styles.link}>
                    {s.name}
                  </Link>
                </H>
                <p>{s.summary}</p>
                <span className={styles.more} aria-hidden="true">
                  En savoir plus <ArrowRight size={16} />
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      {others.length > 0 && (
        <ul className={styles.others}>
          {others.map((s) => (
            <li key={s.slug} className={styles.other}>
              <span className={styles.iconDark}>
                <ServiceIcon name={s.icon} />
              </span>
              <div>
                <H className={styles.title}>
                  <Link href={`/prestations/${s.slug}`} className={styles.link}>
                    {s.name}
                  </Link>
                </H>
                <p>{s.summary}</p>
              </div>
              <ArrowRight size={20} aria-hidden="true" className={styles.otherArrow} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
