// ============================================================================
// Site public : contenus lus en base via des fonctions mises en cache
// (« use cache ») — les pages restent statiques et sont régénérées après chaque
// modification faite dans le back-office.
// ============================================================================
import type { Metadata } from 'next'
import { getCurrentYear, getSiteChrome } from '@/backend/modules/content/public'
import { SiteFrame } from '@/frontend/components/layout/SiteFrame'
import { homeTitle, siteDescription } from '@/frontend/config/site'
import { isConfirmed } from '@/frontend/lib/claims'
import { isIndexable } from '@/shared/config/site-url'

export async function generateMetadata(): Promise<Metadata> {
  const { settings, claims } = await getSiteChrome()
  return {
    title: { default: homeTitle(settings), template: `%s | ${settings.companyName}` },
    description: siteDescription(settings, isConfirmed(claims, 'freeQuote')),
    applicationName: settings.companyName,
    robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { type: 'website', locale: 'fr_FR', siteName: settings.companyName },
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [chrome, year] = await Promise.all([getSiteChrome(), getCurrentYear()])
  return (
    <SiteFrame chrome={chrome} year={year}>
      {children}
    </SiteFrame>
  )
}
