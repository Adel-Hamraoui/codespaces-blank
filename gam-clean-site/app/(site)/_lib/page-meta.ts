// Métadonnées d'une page publique : nom du site et lieux proviennent des paramètres de l'entreprise.
import type { Metadata } from 'next'
import { getSiteChrome } from '@/backend/modules/content/public'
import { pageMetadata } from '@/frontend/lib/seo'
import type { SiteSettings } from '@/shared/types/content'

type Input = Omit<Parameters<typeof pageMetadata>[0], 'siteName'>

export async function sitePageMetadata(input: Input | ((s: SiteSettings) => Input)): Promise<Metadata> {
  const { settings } = await getSiteChrome()
  return pageMetadata({ ...(typeof input === 'function' ? input(settings) : input), siteName: settings.companyName })
}
