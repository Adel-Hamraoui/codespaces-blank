import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { company } from '@/content/site'
import styles from './status-page.module.css'

export const metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <section className={`section ${styles.wrap}`}>
      <div className="container container-narrow text-center">
        <p className="kicker">Erreur 404</p>
        <h1>Cette page n’existe pas ou a été déplacée</h1>
        <p className="lead">Le site a été refondu : la plupart des contenus sont accessibles depuis ces pages.</p>
        <div className={styles.actions}>
          <Link href="/" className="btn btn-lg">
            Retour à l’accueil
          </Link>
          <Link href="/prestations" className="btn btn-secondary btn-lg">
            Nos prestations <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <p className={styles.back}>
          Besoin d’aide ? Appelez-nous au <a href={company.phone.href}>{company.phone.display}</a>
        </p>
      </div>
    </section>
  )
}
