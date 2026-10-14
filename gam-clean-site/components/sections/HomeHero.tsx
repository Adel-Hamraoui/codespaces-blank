import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Phone } from 'lucide-react'
import heroImage from '@/assets/images/nettoyage-hall-vitres-bureaux.jpg'
import { claims, company } from '@/content/site'
import { Sparkle } from '@/components/ui/Sparkle'
import styles from './HomeHero.module.css'

export function HomeHero() {
  const reassurance = [
    claims.freeQuote.confirmed ? 'Devis gratuit et sans engagement' : 'Devis détaillé après visite',
    'Interventions ponctuelles ou contrats d’entretien',
    `Entreprise basée à ${company.address.city} (${company.address.departmentCode})`,
  ]

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <p className="kicker">
            <Sparkle size={11} />
            Nettoyage professionnel · {company.serviceArea.short}
          </p>
          <h1 id="hero-title" className={styles.title}>
            Des locaux professionnels <span className={styles.mark}>propres</span>, sans perturber votre activité.
          </h1>
          <p className={styles.lead}>
            GAM CLEAN entretient vos bureaux, commerces, sites industriels et parties communes, et intervient
            pour les vitres, les fins de chantier et la remise en état. À la fréquence et aux horaires qui vous
            conviennent.
          </p>
          <div className={styles.actions}>
            <Link
              href="/devis"
              className="btn btn-lg"
              data-track="cta_devis_click"
              data-track-location="hero"
            >
              Demander un devis <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a href={company.phone.href} className="btn btn-secondary btn-lg" data-track-location="hero">
              <Phone size={18} aria-hidden="true" />
              {company.phone.display}
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
              src={heroImage}
              alt="Entretien du hall vitré d’un immeuble de bureaux : lavage du sol et nettoyage des vitres"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 44vw, 100vw"
              quality={70}
              className={styles.image}
              placeholder="blur"
            />
          </div>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Un seul prestataire pour</p>
            <ul className={styles.cardList}>
              <li>Bureaux</li>
              <li>Commerces</li>
              <li>Industrie</li>
              <li>Copropriétés</li>
              <li>Vitres</li>
              <li>Fin de chantier</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
