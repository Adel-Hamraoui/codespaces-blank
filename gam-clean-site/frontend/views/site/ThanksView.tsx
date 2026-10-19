import Link from 'next/link'
import { CircleCheck, Phone } from 'lucide-react'
import type { SiteSettings } from '@/shared/types/content'
import styles from './StatusPage.module.css'

export function ThanksView({ settings: company }: { settings: SiteSettings }) {
  return (
    <section className={`section ${styles.wrap}`}>
      <div className="container container-narrow text-center">
        <span className={styles.iconOk}>
          <CircleCheck size={40} aria-hidden="true" />
        </span>
        <h1>Merci, votre demande a bien été envoyée</h1>
        <p className="lead">
          Nous l’étudions et revenons vers vous {company.responseTime ?? 'dès que possible'} par téléphone ou par e-mail
          pour préciser votre besoin.
        </p>
        <p className="muted">
          Une précision à ajouter ou une demande urgente ? Appelez-nous directement.
        </p>
        <div className={styles.actions}>
          <a href={company.phone.href} className="btn btn-lg" data-track-location="merci">
            <Phone size={18} aria-hidden="true" /> {company.phone.display}
          </a>
          <Link href="/prestations" className="btn btn-secondary btn-lg">
            Voir nos prestations
          </Link>
        </div>
      </div>
    </section>
  )
}
