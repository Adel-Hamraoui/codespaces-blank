import type { Metadata } from 'next'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { listClaimsAdmin, listFaqAdmin, listSectorsAdmin, listServicesAdmin } from '@/backend/modules/content/repository'
import { ContentHubView } from '@/frontend/views/admin/ContentHubView'

export const metadata: Metadata = { title: 'Contenu du site' }

export default async function ContentPage() {
  await requireAdmin('editContent')
  const sql = requireSql()
  const [services, faq, sectors, claims] = await Promise.all([
    listServicesAdmin(sql),
    listFaqAdmin(sql),
    listSectorsAdmin(sql),
    listClaimsAdmin(sql),
  ])
  return (
    <ContentHubView
      counts={{
        services: services.length,
        faq: faq.length,
        sectors: sectors.length,
        claims: claims.length,
        claimsConfirmed: claims.filter((c) => c.confirmed).length,
      }}
    />
  )
}
