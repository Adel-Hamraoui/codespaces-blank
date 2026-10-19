import { ExternalLink } from 'lucide-react'
import { formatSiret } from '@/frontend/lib/format'
import { IDF_DEPARTMENTS } from '@/shared/constants'
import type { SiteSettings } from '@/shared/types/content'
import styles from './TrustBand.module.css'

/**
 * Bandeau de repères vérifiables, juste sous l'accroche.
 * Uniquement des faits issus des données : nombre de prestations publiées,
 * zone déclarée, identification légale. Aucun chiffre commercial inventé.
 */
export function TrustBand({ settings, serviceCount }: { settings: SiteSettings; serviceCount: number }) {
  const coversIdf = settings.serviceArea.areas.includes('Île-de-France')
  const siren = settings.siret.slice(0, 9)
  const items = [
    { figure: String(serviceCount), label: 'prestations', text: 'de l’entretien courant à la remise en état' },
    ...(coversIdf
      ? [{ figure: String(IDF_DEPARTMENTS.length), label: 'départements', text: `toute l’Île-de-France, depuis ${settings.address.city}` }]
      : []),
    { figure: '2', label: 'formules', text: 'intervention ponctuelle ou contrat d’entretien' },
  ]

  return (
    <section className={styles.band} aria-label="Repères">
      <div className={`container ${styles.inner}`}>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.label} className={styles.item}>
              <span className={styles.figure}>{item.figure}</span>
              <span className={styles.text}>
                <strong>{item.label}</strong> {item.text}
              </span>
            </li>
          ))}
          <li className={styles.item}>
            <span className={styles.siret}>SIRET</span>
            <span className={styles.text}>
              <strong>{formatSiret(settings.siret)}</strong>{' '}
              <a
                href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${siren}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                vérifier sur l’Annuaire des entreprises
                <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only">(nouvel onglet)</span>
              </a>
            </span>
          </li>
        </ul>
      </div>
    </section>
  )
}
