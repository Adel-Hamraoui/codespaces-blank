import Link from 'next/link'
import { CircleAlert, Mail, Phone } from 'lucide-react'
import type { SiteSettings } from '@/shared/types/content'
import styles from './StatusPage.module.css'

/** Page de repli quand un envoi sans JavaScript échoue (champs manquants ou service indisponible). */
export function SendFailedView({ settings: company }: { settings: SiteSettings }) {
  return (
    <section className={`section ${styles.wrap}`}>
      <div className="container container-narrow text-center">
        <span className={styles.iconWarn}>
          <CircleAlert size={40} aria-hidden="true" />
        </span>
        <h1>Votre demande n’a pas pu être envoyée</h1>
        <p className="lead">
          Un champ obligatoire était peut-être incomplet, ou le service d’envoi est momentanément indisponible. Vous
          pouvez réessayer ou nous contacter directement.
        </p>
        <div className={styles.actions}>
          <a href={company.phone.href} className="btn btn-lg" data-track-location="envoi-impossible">
            <Phone size={18} aria-hidden="true" /> {company.phone.display}
          </a>
          <a href={`mailto:${company.email}`} className="btn btn-secondary btn-lg" data-track-location="envoi-impossible">
            <Mail size={18} aria-hidden="true" /> Écrire un e-mail
          </a>
        </div>
        <p className={styles.back}>
          <Link href="/devis">Revenir au formulaire de devis</Link>
        </p>
      </div>
    </section>
  )
}
