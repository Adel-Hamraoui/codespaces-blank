import type { Metadata } from 'next'
import { getCurrentYear, getSiteChrome } from '@/backend/modules/content/public'
import { SiteFrame } from '@/frontend/components/layout/SiteFrame'
import { NotFoundView } from '@/frontend/views/site/NotFoundView'

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteChrome()
  return { title: `Page introuvable | ${settings.companyName}`, robots: { index: false, follow: true } }
}

/** Page 404 (adresse inconnue ou contenu retiré), avec l'habillage du site. */
export default async function NotFound() {
  const [chrome, year] = await Promise.all([getSiteChrome(), getCurrentYear()])
  return (
    <SiteFrame chrome={chrome} year={year}>
      <NotFoundView settings={chrome.settings} />
    </SiteFrame>
  )
}
