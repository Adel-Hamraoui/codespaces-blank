import { Quote } from 'lucide-react'
import { testimonials } from '@/content/site'
import { SectionHeading } from '@/components/ui/SectionHeading'
import styles from './Testimonials.module.css'

/**
 * Témoignages clients — ne s'affiche que si content/site.ts en contient.
 * Aucun témoignage n'est inventé : la section reste masquée tant que la liste est vide.
 */
export function Testimonials() {
  if (testimonials.length === 0) return null
  return (
    <section className="section bg-mist" aria-labelledby="temoignages">
      <div className="container">
        <SectionHeading id="temoignages" kicker="Témoignages" title="Ce qu’en disent nos clients" />
        <ul className="grid grid-3">
          {testimonials.map((t) => (
            <li key={t.quote} className={`card ${styles.item}`}>
              <Quote size={24} aria-hidden="true" className={styles.icon} />
              <blockquote className={styles.quote}>
                <p>{t.quote}</p>
              </blockquote>
              <p className={styles.author}>
                {t.author}
                {t.organization && <span>, {t.organization}</span>}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
