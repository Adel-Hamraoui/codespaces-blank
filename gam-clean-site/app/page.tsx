import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import imgSuivi from '@/assets/images/point-de-suivi-prestation.jpg'
import { HomeHero } from '@/components/sections/HomeHero'
import { ServiceCards } from '@/components/sections/ServiceCards'
import { WhyUs } from '@/components/sections/WhyUs'
import { MethodSteps } from '@/components/sections/MethodSteps'
import { ServiceArea } from '@/components/sections/ServiceArea'
import { FaqList } from '@/components/sections/FaqList'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaBand } from '@/components/sections/CtaBand'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { sectors } from '@/content/sectors'
import { getFaq } from '@/content/faq'
import { pageMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = pageMetadata({
  title: 'GAM CLEAN — Entreprise de nettoyage professionnel à Bondy (93)',
  absoluteTitle: true,
  description:
    'Nettoyage de bureaux, commerces, sites industriels, vitres, fin de chantier et remise en état. Basés à Bondy (93), en Île-de-France. Devis gratuit.',
  path: '/',
})

export default function HomePage() {
  const faq = getFaq().slice(0, 5)

  return (
    <>
      <HomeHero />

      {/* ---------- Prestations ---------- */}
      <section className="section" aria-labelledby="prestations">
        <div className="container">
          <div className={styles.headRow}>
            <SectionHeading
              id="prestations"
              kicker="Prestations"
              title="Ce que GAM CLEAN prend en charge"
              lead="De l’entretien quotidien de vos bureaux à la remise en état après travaux ou sinistre, chaque prestation est organisée selon vos locaux et votre activité."
            />
            <Link href="/prestations" className={`link-arrow ${styles.headLink}`}>
              Toutes les prestations <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ServiceCards />
        </div>
      </section>

      {/* ---------- Pourquoi GAM CLEAN ---------- */}
      <section className="section bg-navy on-dark" aria-labelledby="pourquoi">
        <div className="container">
          <SectionHeading
            id="pourquoi"
            kicker="Pourquoi GAM CLEAN"
            title="Une organisation claire, du premier appel au suivi"
            lead="Pas de promesse vague : une méthode, un interlocuteur et un devis qui correspond à vos locaux."
          />
          <WhyUs />
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
              <Link
                href="/devis"
                className="btn"
                data-track="cta_devis_click"
                data-track-location="methode"
              >
                Commencer ma demande <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.methodVisual}>
              <Image
                src={imgSuivi}
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
      <section className="section bg-mist" aria-labelledby="secteurs">
        <div className="container">
          <SectionHeading
            id="secteurs"
            kicker="Pour qui"
            title="Des solutions adaptées à votre activité"
            lead="Chaque environnement a ses contraintes : horaires, public, sécurité, hygiène."
          />
          <ul className={styles.sectors}>
            {sectors.map((s) => (
              <li key={s.id}>
                <Link href={`/secteurs#${s.id}`} className={styles.sector}>
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

      {/* ---------- Zone d'intervention ---------- */}
      <section className="section" aria-label="Zone d’intervention">
        <div className="container">
          <ServiceArea />
        </div>
      </section>

      <Testimonials />

      {/* ---------- FAQ ---------- */}
      <section className="section bg-mist" aria-labelledby="faq">
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

      <CtaBand location="accueil-final" />
    </>
  )
}
