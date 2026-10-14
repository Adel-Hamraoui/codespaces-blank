import { PageHero } from '@/components/sections/PageHero'
import { FaqList } from '@/components/sections/FaqList'
import { CtaBand } from '@/components/sections/CtaBand'
import { JsonLd } from '@/components/seo/JsonLd'
import { getFaq } from '@/content/faq'
import { faqJsonLd, pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Questions fréquentes sur nos prestations de nettoyage',
  description:
    'Zones d’intervention, devis, contrats ou interventions ponctuelles, horaires, matériel : les réponses aux questions fréquentes sur GAM CLEAN.',
  path: '/faq',
})

export default function FaqPage() {
  const items = getFaq()
  return (
    <>
      <PageHero
        crumbs={[{ name: 'FAQ', path: '/faq' }]}
        kicker="Questions fréquentes"
        title="Vos questions, nos réponses"
        lead={<p>Tout ce qu’il faut savoir sur nos prestations et le déroulement d’une demande de devis.</p>}
      />
      <section className="section" aria-label="Questions fréquentes">
        <div className="container container-narrow">
          <FaqList items={items} />
        </div>
      </section>
      <CtaBand
        location="faq-final"
        title="Vous n’avez pas trouvé votre réponse ?"
        text="Appelez-nous ou décrivez votre besoin dans le formulaire : nous vous répondons directement."
      />
      <JsonLd data={faqJsonLd(items)} />
    </>
  )
}
