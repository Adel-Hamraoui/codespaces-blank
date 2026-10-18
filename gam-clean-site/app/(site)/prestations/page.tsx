import { getSiteChrome } from '@/backend/modules/content/public'
import { ServicesView } from '@/frontend/views/site/ServicesView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata({
    title: 'Prestations de nettoyage professionnel en Île-de-France',
    description:
      'Bureaux, commerces et ERP, industrie, vitres et façades, fin de chantier, après sinistre, prestations spécialisées : toutes nos prestations.',
    path: '/prestations',
  })

export default async function PrestationsPage() {
  return <ServicesView chrome={await getSiteChrome()} />
}
