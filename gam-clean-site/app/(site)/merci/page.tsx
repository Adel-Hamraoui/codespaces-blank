import { getSiteChrome } from '@/backend/modules/content/public'
import { ThanksView } from '@/frontend/views/site/ThanksView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata((s) => ({
    title: 'Demande envoyée',
    description: `Votre demande a bien été transmise à ${s.companyName}.`,
    path: '/merci',
    noindex: true,
  }))

export default async function MerciPage() {
  return <ThanksView settings={(await getSiteChrome()).settings} />
}
