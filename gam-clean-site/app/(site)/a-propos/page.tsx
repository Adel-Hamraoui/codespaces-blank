import { getSiteChrome } from '@/backend/modules/content/public'
import { AboutView } from '@/frontend/views/site/AboutView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata((s) => ({
    title: `Qui sommes-nous : entreprise de nettoyage à ${s.address.city} (${s.address.departmentCode})`,
    description: `${s.companyName}, entreprise de nettoyage professionnel basée à ${s.address.city} : notre approche, notre méthode de travail et nos informations légales (SIRET, TVA).`,
    path: '/a-propos',
  }))

export default async function AProposPage() {
  return <AboutView chrome={await getSiteChrome()} />
}
