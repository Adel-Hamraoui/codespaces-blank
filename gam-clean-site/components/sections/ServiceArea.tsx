import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { company } from '@/content/site'
import styles from './ServiceArea.module.css'

/** Zone d'intervention : schéma décoratif (pas une carte) + texte. Aucune ressource tierce. */
export function ServiceArea() {
  return (
    <div className={styles.wrap}>
      <div className={styles.diagram} aria-hidden="true">
        <svg viewBox="0 0 400 400" className={styles.svg}>
          <circle cx="200" cy="200" r="190" className={styles.ring3} />
          <circle cx="200" cy="200" r="125" className={styles.ring2} />
          <circle cx="200" cy="200" r="58" className={styles.ring1} />
          <text x="200" y="38" className={styles.ringLabel}>
            Île-de-France
          </text>
          <text x="200" y="104" className={styles.ringLabel}>
            Seine-Saint-Denis
          </text>
        </svg>
        <span className={styles.pin}>
          <MapPin size={22} />
          {company.address.city}
        </span>
      </div>
      <div>
        <p className="kicker">Zone d’intervention</p>
        <h2>
          Basés à {company.address.city}, nous intervenons dans toute l’{company.address.region}
        </h2>
        <p className="lead">
          Paris, petite et grande couronne : vos locaux sont situés en {company.address.region} ? Indiquez leur
          ville dans votre demande, nous organisons la visite.
        </p>
        <ul className="tag-list" aria-label="Zones d’intervention">
          {company.serviceArea.areas.map((area) => (
            <li key={area} className="tag">
              {area}
            </li>
          ))}
        </ul>
        <p className={styles.cta}>
          <Link href="/devis" className="link-arrow" data-track="cta_devis_click" data-track-location="zone">
            Demander un devis pour vos locaux <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </p>
      </div>
    </div>
  )
}
