import { getSiteChrome } from '@/backend/modules/content/public'
import { PrivacyView } from '@/frontend/views/site/PrivacyView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata((s) => ({
    title: 'Politique de confidentialité',
    description: `Comment ${s.companyName} traite les données transmises via les formulaires de devis, de contact et d’avis : finalités, durée de conservation, destinataires, droits.`,
    path: '/politique-de-confidentialite',
  }))

export default async function ConfidentialitePage() {
  const { settings } = await getSiteChrome()
  return <PrivacyView settings={settings} analytics={process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || null} />
}
