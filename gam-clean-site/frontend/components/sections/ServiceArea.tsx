import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { IDF_DEPARTMENTS } from '@/shared/constants'
import type { SiteSettings } from '@/shared/types/content'
import styles from './ServiceArea.module.css'

/** Zone d'intervention : schéma décoratif (pas une carte) + texte. Aucune ressource tierce. */
export function ServiceArea({ settings }: { settings: SiteSettings }) {
  const { address, serviceArea } = settings
  // « Toute l'Île-de-France » se décline en ses huit départements (référence géographique publique).
  const departments = serviceArea.areas.includes('Île-de-France') ? IDF_DEPARTMENTS : []
  return (
    <div className={styles.wrap}>
      <div className={styles.diagram} aria-hidden="true">
        <svg viewBox="0 0 400 400" className={styles.svg}>
          <circle cx="200" cy="200" r="190" className={styles.ring3} />
          <circle cx="200" cy="200" r="125" className={styles.ring2} />
          <circle cx="200" cy="200" r="58" className={styles.ring1} />
          <text x="200" y="38" className={styles.ringLabel}>
            {address.region}
          </text>
          <text x="200" y="104" className={styles.ringLabel}>
            {address.department}
          </text>
        </svg>
        <span className={styles.pin}>
          <MapPin size={22} />
          {address.city}
        </span>
      </div>
      <div>
        <p className="kicker">Zone d’intervention</p>
        <h2>
          Basés à {address.city}, nous intervenons dans toute l’{address.region}
        </h2>
        <p className="lead">
          {departments.length > 0 ? 'Paris, petite et grande couronne : indiquez' : 'Indiquez'} la ville de vos locaux
          dans votre demande, nous organisons la visite.
        </p>
        {departments.length > 0 ? (
          <ul className={styles.departments} aria-label="Départements couverts">
            {departments.map((d) => (
              <li key={d.code} className={d.code === address.departmentCode ? styles.home : undefined}>
                <span className={styles.code}>{d.code}</span>
                {d.name}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="tag-list" aria-label="Zones d’intervention">
            {serviceArea.areas.map((area) => (
              <li key={area} className="tag">
                {area}
              </li>
            ))}
          </ul>
        )}
        <p className={styles.cta}>
          <Link href="/devis" className="link-arrow" data-track="cta_devis_click" data-track-location="zone">
            Demander un devis pour vos locaux <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </p>
      </div>
    </div>
  )
}
