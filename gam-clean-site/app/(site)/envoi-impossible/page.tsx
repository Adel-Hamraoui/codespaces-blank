import { getSiteChrome } from '@/backend/modules/content/public'
import { SendFailedView } from '@/frontend/views/site/SendFailedView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata((s) => ({
    title: 'Demande non envoyée',
    description: `Votre demande n’a pas pu être transmise. Contactez ${s.companyName} par téléphone ou par e-mail.`,
    path: '/envoi-impossible',
    noindex: true,
  }))

export default async function EnvoiImpossiblePage() {
  return <SendFailedView settings={(await getSiteChrome()).settings} />
}
