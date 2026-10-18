import { Suspense, type ReactNode } from 'react'
import { Analytics } from '@/frontend/components/analytics/Analytics'
import { JsonLd } from '@/frontend/components/seo/JsonLd'
import { siteDescription } from '@/frontend/config/site'
import { isConfirmed } from '@/frontend/lib/claims'
import { localBusinessJsonLd } from '@/frontend/lib/seo'
import type { SiteChrome } from '@/shared/types/content'
import { Footer } from './Footer'
import { Header, HeaderView } from './Header'
import { MobileActionBar, MobileActionBarView } from './MobileActionBar'

/**
 * Habillage commun des pages publiques : lien d'évitement, en-tête, pied de page,
 * barre d'actions mobile, données structurées de l'entreprise.
 * Les composants qui lisent l'adresse courante sont entourés de <Suspense> : le
 * repli (identique, sans rubrique active) sert au prérendu des adresses inconnues.
 */
export function SiteFrame({ chrome, year, children }: { chrome: SiteChrome; year: number; children: ReactNode }) {
  const { settings, claims, services } = chrome
  const freeQuote = isConfirmed(claims, 'freeQuote')
  const header = {
    brandName: settings.companyName,
    phone: { href: settings.phone.href, display: settings.phone.display },
    services: services.map(({ slug, name, summary, icon }) => ({ slug, name, summary, icon })),
  }
  const bar = { phone: { href: settings.phone.href }, freeQuote }

  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <Suspense fallback={<HeaderView {...header} pathname={null} />}>
        <Header {...header} />
      </Suspense>
      <main id="contenu" tabIndex={-1}>
        {children}
      </main>
      <Footer settings={settings} services={services} year={year} />
      <Suspense fallback={<MobileActionBarView {...bar} pathname={null} />}>
        <MobileActionBar {...bar} />
      </Suspense>
      <JsonLd data={localBusinessJsonLd(settings, siteDescription(settings, freeQuote))} />
      <Analytics />
    </>
  )
}
