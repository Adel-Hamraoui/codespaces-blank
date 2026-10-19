import { getSiteChrome } from '@/backend/modules/content/public'
import { ContactView } from '@/frontend/views/site/ContactView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata((s) => ({
    title: `Contact : entreprise de nettoyage à ${s.address.city} (${s.address.departmentCode})`,
    description: `Appelez ${s.companyName} au ${s.phone.display}, écrivez-nous ou envoyez un message. Entreprise de nettoyage professionnel basée à ${s.address.city} (${s.address.departmentCode}), intervention en ${s.address.region}.`,
    path: '/contact',
  }))

export default async function ContactPage() {
  return <ContactView chrome={await getSiteChrome()} />
}
