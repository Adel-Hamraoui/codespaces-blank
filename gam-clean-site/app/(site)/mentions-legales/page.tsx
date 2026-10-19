import { getSiteChrome } from '@/backend/modules/content/public'
import { LegalNoticeView } from '@/frontend/views/site/LegalNoticeView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata((s) => ({
    title: 'Mentions légales',
    description: `Mentions légales du site ${s.companyName} : éditeur, hébergeur, propriété intellectuelle.`,
    path: '/mentions-legales',
  }))

export default async function MentionsLegalesPage() {
  return <LegalNoticeView settings={(await getSiteChrome()).settings} />
}
