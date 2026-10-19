import Link from 'next/link'
import { ArrowRight, Mail, Phone } from 'lucide-react'
import { Sparkle } from '@/frontend/components/ui/Sparkle'
import styles from './CtaBand.module.css'

type Props = {
  phone: { href: string; display: string }
  email: string
  /** Affirmation « devis gratuit » confirmée dans le back-office. */
  freeQuote: boolean
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
  phone,
  email,
  freeQuote,
}: Props) {
  const href = serviceSlug ? `/devis?prestation=${serviceSlug}` : '/devis'
  return (
    <section className={`${styles.band} on-dark`} aria-labelledby={`cta-${location}`}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className="kicker">
            <Sparkle size={11} />
            {freeQuote ? 'Devis gratuit et sans engagement' : 'Demande de devis'}
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
          <a href={phone.href} className="btn btn-ghost-dark btn-lg" data-track-location={location}>
            <Phone size={18} aria-hidden="true" /> {phone.display}
          </a>
          <a href={`mailto:${email}`} className={styles.mail} data-track-location={location}>
            <Mail size={16} aria-hidden="true" /> {email}
          </a>
        </div>
      </div>
    </section>
  )
}
