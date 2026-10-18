import { getGeneralFaq, getSiteChrome } from '@/backend/modules/content/public'
import { FaqView } from '@/frontend/views/site/FaqView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata({
    title: 'Questions fréquentes sur nos prestations de nettoyage',
    description:
      'Zones d’intervention, devis, contrats ou interventions ponctuelles, horaires, matériel : les réponses aux questions fréquentes.',
    path: '/faq',
  })

export default async function FaqPage() {
  const [chrome, items] = await Promise.all([getSiteChrome(), getGeneralFaq()])
  return <FaqView chrome={chrome} items={items} />
}
