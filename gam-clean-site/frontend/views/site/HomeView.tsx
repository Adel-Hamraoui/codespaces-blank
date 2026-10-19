import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { images } from '@/frontend/assets/images'
import { CtaBand } from '@/frontend/components/sections/CtaBand'
import { FaqList } from '@/frontend/components/sections/FaqList'
import { HomeHero } from '@/frontend/components/sections/HomeHero'
import { MethodSteps } from '@/frontend/components/sections/MethodSteps'
import { ServiceArea } from '@/frontend/components/sections/ServiceArea'
import { ServiceCards } from '@/frontend/components/sections/ServiceCards'
import { Testimonials } from '@/frontend/components/sections/Testimonials'
import { TrustBand } from '@/frontend/components/sections/TrustBand'
import { WhyUs } from '@/frontend/components/sections/WhyUs'
import { SectionHeading } from '@/frontend/components/ui/SectionHeading'
import { ServiceIcon } from '@/frontend/components/ui/ServiceIcon'
import { isConfirmed } from '@/frontend/lib/claims'
import type { FaqItem, PublishedReview, Sector, SiteChrome } from '@/shared/types/content'
import styles from './HomeView.module.css'

type Props = {
  chrome: SiteChrome
  faq: FaqItem[]
  sectors: Sector[]
  reviews: PublishedReview[]
}

export function HomeView({ chrome, faq, sectors, reviews }: Props) {
  const { settings, claims, services } = chrome
  const freeQuote = isConfirmed(claims, 'freeQuote')

  return (
    <>
      <HomeHero settings={settings} freeQuote={freeQuote} services={services} />
      <TrustBand settings={settings} serviceCount={services.length} />

      {/* ---------- Prestations ---------- */}
      <section className="section" aria-labelledby="prestations">
        <div className="container">
          <div className={styles.headRow}>
            <SectionHeading
              id="prestations"
              kicker="Prestations"
              title={`Ce que ${settings.companyName} prend en charge`}
              lead="De l’entretien quotidien de vos bureaux à la remise en état après travaux ou sinistre, chaque prestation est organisée selon vos locaux et votre activité."
            />
            <Link href="/prestations" className={`link-arrow ${styles.headLink}`}>
              Toutes les prestations <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ServiceCards services={services} />
        </div>
      </section>

      {/* ---------- Pourquoi nous ---------- */}
      <section className="section bg-navy on-dark" aria-labelledby="pourquoi">
        <div className="container">
          <SectionHeading
            id="pourquoi"
            kicker={`Pourquoi ${settings.companyName}`}
            title="Une organisation claire, du premier appel au suivi"
            lead="Pas de promesse vague : une méthode, un interlocuteur et un devis qui correspond à vos locaux."
          />
          <WhyUs settings={settings} claims={claims} />
        </div>
      </section>

      {/* ---------- Méthode ---------- */}
      <section className="section" aria-labelledby="methode">
        <div className="container">
          <div className={styles.methodGrid}>
            <div>
              <SectionHeading
                id="methode"
                kicker="Comment ça se passe"
                title="De votre demande à la première intervention"
                lead="Quatre étapes simples, sans engagement tant que vous n’avez pas validé le devis."
              />
              <Link href="/devis" className="btn" data-track="cta_devis_click" data-track-location="methode">
                Commencer ma demande <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.methodVisual}>
              <Image
                src={images['point-de-suivi']}
                alt="Une responsable d’équipe d’entretien fait le point avec un client dans un couloir de bureaux"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className={styles.methodImg}
                placeholder="blur"
              />
            </div>
          </div>
          <MethodSteps />
        </div>
      </section>

      {/* ---------- Secteurs ---------- */}
      {sectors.length > 0 && (
        <section className="section bg-mist" aria-labelledby="secteurs">
          <div className="container">
            <SectionHeading
              id="secteurs"
              kicker="Pour qui"
              title="Des solutions adaptées à votre activité"
              lead="Chaque environnement a ses contraintes : horaires, public, sécurité, hygiène."
            />
            <ul className={styles.sectors}>
              {sectors.map((s) => (
                <li key={s.slug} className="reveal">
                  <Link href={`/secteurs#${s.slug}`} className={styles.sector}>
                    <span className={styles.sectorIcon}>
                      <ServiceIcon name={s.icon} />
                    </span>
                    <span className={styles.sectorName}>{s.name}</span>
                    <ArrowRight size={18} aria-hidden="true" className={styles.sectorArrow} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- Zone d'intervention ---------- */}
      <section className="section" aria-label="Zone d’intervention">
        <div className="container">
          <ServiceArea settings={settings} />
        </div>
      </section>

      <Testimonials reviews={reviews} />

      {/* ---------- FAQ ---------- */}
      {faq.length > 0 && (
        <section className={`section ${reviews.length > 0 ? '' : 'bg-mist'}`} aria-labelledby="faq">
          <div className={`container ${styles.faqGrid}`}>
            <div>
              <SectionHeading
                id="faq"
                kicker="Questions fréquentes"
                title="Avant de nous contacter"
                lead="L’essentiel à savoir sur nos prestations et le déroulement d’une demande."
              />
              <Link href="/faq" className="link-arrow">
                Toutes les questions <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <FaqList items={faq} />
          </div>
        </section>
      )}

      <CtaBand location="accueil-final" phone={settings.phone} email={settings.email} freeQuote={freeQuote} />
    </>
  )
}
