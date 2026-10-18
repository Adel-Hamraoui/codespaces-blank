import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Phone } from 'lucide-react'
import { images } from '@/frontend/assets/images'
import { Sparkle } from '@/frontend/components/ui/Sparkle'
import type { ServiceSummary, SiteSettings } from '@/shared/types/content'
import styles from './HomeHero.module.css'

type Props = {
  settings: SiteSettings
  freeQuote: boolean
  services: Pick<ServiceSummary, 'slug' | 'name'>[]
}

export function HomeHero({ settings, freeQuote, services }: Props) {
  const reassurance = [
    freeQuote ? 'Devis gratuit et sans engagement' : 'Devis détaillé après visite',
    'Interventions ponctuelles ou contrats d’entretien',
    `Entreprise basée à ${settings.address.city} (${settings.address.departmentCode})`,
  ]

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <p className="kicker">
            <Sparkle size={11} />
            Nettoyage professionnel · {settings.serviceArea.short}
          </p>
          <h1 id="hero-title" className={styles.title}>
            Des locaux professionnels <span className={styles.mark}>propres</span>, sans perturber votre activité.
          </h1>
          <p className={styles.lead}>
            {settings.companyName} entretient vos bureaux, commerces, sites industriels et parties communes, et
            intervient pour les vitres, les fins de chantier et la remise en état. À la fréquence et aux horaires qui
            vous conviennent.
          </p>
          <div className={styles.actions}>
            <Link href="/devis" className="btn btn-lg" data-track="cta_devis_click" data-track-location="hero">
              Demander un devis <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a href={settings.phone.href} className="btn btn-secondary btn-lg" data-track-location="hero">
              <Phone size={18} aria-hidden="true" />
              {settings.phone.display}
            </a>
          </div>
          <ul className={styles.reassurance}>
            {reassurance.map((item) => (
              <li key={item}>
                <Check size={18} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.visual}>
          <div className={styles.frame}>
            <Image
              src={images['hall-vitres']}
              alt="Entretien du hall vitré d’un immeuble de bureaux : lavage du sol et nettoyage des vitres"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 44vw, 100vw"
              quality={70}
              className={styles.image}
              placeholder="blur"
            />
          </div>
          {/* Démarrage rapide : la prestation choisie est présélectionnée dans le formulaire. */}
          <nav className={`${styles.card} on-dark`} aria-labelledby="hero-demarrage">
            <p id="hero-demarrage" className={styles.cardTitle}>
              Démarrer une demande pour…
            </p>
            <ul className={styles.cardList}>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/devis?prestation=${s.slug}`}
                    className={styles.chip}
                    data-track="cta_devis_click"
                    data-track-location="hero-raccourci"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  )
}
