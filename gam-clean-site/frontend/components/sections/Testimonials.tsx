import { SectionHeading } from '@/frontend/components/ui/SectionHeading'
import { Stars } from '@/frontend/components/ui/Stars'
import { formatMonth } from '@/frontend/lib/format'
import type { PublishedReview } from '@/shared/types/content'
import styles from './Testimonials.module.css'

/**
 * Avis clients — uniquement des avis réels, déposés via un lien d'invitation
 * personnel, publiés avec l'accord explicite de leur auteur et après modération.
 * La section reste masquée tant qu'aucun avis n'est publié.
 */
export function Testimonials({ reviews }: { reviews: PublishedReview[] }) {
  if (reviews.length === 0) return null
  return (
    <section className="section bg-mist" aria-labelledby="temoignages">
      <div className="container">
        <SectionHeading
          id="temoignages"
          kicker="Avis clients"
          title="Ce qu’en disent nos clients"
          lead="Des avis déposés par des clients après une intervention, publiés avec leur accord."
        />
        <ul className={`grid grid-3 ${styles.list}`}>
          {reviews.map((r) => (
            <li key={r.id} className={`card ${styles.item} reveal`}>
              <Stars rating={r.rating} />
              <blockquote className={styles.quote}>
                <p>{r.comment}</p>
              </blockquote>
              <p className={styles.author}>
                <span className={styles.name}>{r.authorName}</span>
                {r.authorCompany && <span>, {r.authorCompany}</span>}
              </p>
              <p className={styles.meta}>
                {r.serviceName ? `${r.serviceName} · ` : ''}
                Avis publié en {formatMonth(r.publishedAt)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
