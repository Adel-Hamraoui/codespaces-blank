import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CtaBand } from '@/frontend/components/sections/CtaBand'
import { PageHero } from '@/frontend/components/sections/PageHero'
import { ServiceCards } from '@/frontend/components/sections/ServiceCards'
import { SectionHeading } from '@/frontend/components/ui/SectionHeading'
import { isConfirmed } from '@/frontend/lib/claims'
import type { SiteChrome } from '@/shared/types/content'

export function ServicesView({ chrome }: { chrome: SiteChrome }) {
  const { settings, claims, services } = chrome
  const featuredCount = services.filter((s) => s.featured).length
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Prestations', path: '/prestations' }]}
        kicker="Prestations"
        title="Nos prestations de nettoyage professionnel"
        lead={
          <p>
            Entretien régulier ou intervention ponctuelle : choisissez la prestation qui correspond à vos locaux.
            Chaque proposition est établie après une visite, selon vos surfaces, vos horaires et vos exigences.
          </p>
        }
      >
        <Link href="/devis" className="btn btn-lg" data-track="cta_devis_click" data-track-location="prestations-hero">
          Demander un devis <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </PageHero>

      <section className="section" aria-labelledby="liste-prestations">
        <div className="container">
          <SectionHeading
            id="liste-prestations"
            title="Entretien courant et interventions spécifiques"
            lead={
              featuredCount > 0 && featuredCount < services.length
                ? 'Nos prestations principales, puis nos interventions de remise en état et nos prestations techniques.'
                : undefined
            }
          />
          <ServiceCards services={services} headingLevel="h3" />
        </div>
      </section>

      <section className="section-tight bg-mist" aria-labelledby="besoin-specifique">
        <div className="container container-narrow text-center">
          <h2 id="besoin-specifique">Votre besoin ne figure pas dans la liste ?</h2>
          <p className="lead">
            Décrivez-le simplement dans le formulaire ou par téléphone : chaque demande est étudiée selon la nature de
            vos locaux et de vos équipements.
          </p>
          <Link href="/contact" className="link-arrow">
            Nous poser la question <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <CtaBand location="prestations-final" phone={settings.phone} email={settings.email} freeQuote={isConfirmed(claims, 'freeQuote')} />
    </>
  )
}
