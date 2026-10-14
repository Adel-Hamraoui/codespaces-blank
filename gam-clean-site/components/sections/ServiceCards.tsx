import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { featuredServices, otherServices } from '@/content/services'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import styles from './ServiceCards.module.css'

/** Grille des prestations : 5 prestations principales avec photo + 2 prestations complémentaires. */
export function ServiceCards({ headingLevel = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  return (
    <div className={styles.wrap}>
      <ul className={styles.featured}>
        {featuredServices.map((s, i) => (
          <li key={s.slug} className={`${styles.card} ${i === 0 ? styles.wide : ''}`}>
            {s.image && (
              <div className={styles.media}>
                <Image
                  src={s.image.src}
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
        ))}
      </ul>

      <ul className={styles.others}>
        {otherServices.map((s) => (
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
    </div>
  )
}
