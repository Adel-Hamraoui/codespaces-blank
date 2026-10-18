import { getSiteChrome } from '@/backend/modules/content/public'
import { QuoteView } from '@/frontend/views/site/QuoteView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata({
    title: 'Demande de devis de nettoyage professionnel',
    description:
      'Décrivez vos locaux et la prestation souhaitée : nous vous recontactons pour une visite et un devis détaillé. Bureaux, commerces, industrie, vitres.',
    path: '/devis',
  })

export default async function DevisPage() {
  return <QuoteView chrome={await getSiteChrome()} />
}
