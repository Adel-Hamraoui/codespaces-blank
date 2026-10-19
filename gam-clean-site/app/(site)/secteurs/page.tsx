import { getSectors, getSiteChrome } from '@/backend/modules/content/public'
import { SectorsView } from '@/frontend/views/site/SectorsView'
import { sitePageMetadata } from '../_lib/page-meta'

export const generateMetadata = () =>
  sitePageMetadata({
    title: 'Secteurs d’intervention : bureaux, commerces, industrie',
    description:
      'Bureaux, commerces et ERP, industrie, copropriétés, collectivités, santé : comment nous adaptons nos prestations à chaque secteur.',
    path: '/secteurs',
  })

export default async function SecteursPage() {
  const [chrome, sectors] = await Promise.all([getSiteChrome(), getSectors()])
  return <SectorsView chrome={chrome} sectors={sectors} />
}
