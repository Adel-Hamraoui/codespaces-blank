import Link from 'next/link'
import { ArrowRight, Mail, Phone } from 'lucide-react'
import { claims, company } from '@/content/site'
import { Sparkle } from '@/components/ui/Sparkle'
import styles from './CtaBand.module.css'

type Props = {
  title?: string
  text?: string
  /** Paramètre ajouté au lien de devis (?prestation=…) pour pré-remplir le formulaire. */
  serviceSlug?: string
  location: string
}

/** Bloc de conversion final, présent en bas des pages. */
export function CtaBand({
  title = 'Parlons de vos locaux',
  text = 'Décrivez votre besoin : nous revenons vers vous pour organiser une visite et vous adresser un devis détaillé.',
  serviceSlug,
  location,
}: Props) {
  const href = serviceSlug ? `/devis?prestation=${serviceSlug}` : '/devis'
  return (
    <section className={`${styles.band} on-dark`} aria-labelledby={`cta-${location}`}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className="kicker">
            <Sparkle size={11} />
            {claims.freeQuote.confirmed ? claims.freeQuote.title : 'Demande de devis'}
          </p>
          <h2 id={`cta-${location}`} className={styles.title}>
            {title}
          </h2>
          <p className={styles.text}>{text}</p>
        </div>
        <div className={styles.actions}>
          <Link href={href} className="btn btn-on-dark btn-lg" data-track="cta_devis_click" data-track-location={location}>
            Demander un devis <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <a href={company.phone.href} className="btn btn-ghost-dark btn-lg" data-track-location={location}>
            <Phone size={18} aria-hidden="true" /> {company.phone.display}
          </a>
          <a href={`mailto:${company.email}`} className={styles.mail} data-track-location={location}>
            <Mail size={16} aria-hidden="true" /> {company.email}
          </a>
        </div>
      </div>
    </section>
  )
}
