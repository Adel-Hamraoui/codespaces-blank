import { CtaBand } from '@/frontend/components/sections/CtaBand'
import { FaqExplorer } from '@/frontend/components/sections/FaqExplorer'
import { PageHero } from '@/frontend/components/sections/PageHero'
import { JsonLd } from '@/frontend/components/seo/JsonLd'
import { isConfirmed } from '@/frontend/lib/claims'
import { faqJsonLd } from '@/frontend/lib/seo'
import type { FaqItem, SiteChrome } from '@/shared/types/content'

export function FaqView({ chrome, items }: { chrome: SiteChrome; items: FaqItem[] }) {
  const { settings, claims } = chrome
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
          <FaqExplorer items={items} />
        </div>
      </section>
      <CtaBand
        location="faq-final"
        title="Vous n’avez pas trouvé votre réponse ?"
        text="Appelez-nous ou décrivez votre besoin dans le formulaire : nous vous répondons directement."
        phone={settings.phone}
        email={settings.email}
        freeQuote={isConfirmed(claims, 'freeQuote')}
      />
      {items.length > 0 && <JsonLd data={faqJsonLd(items)} />}
    </>
  )
}
