import type { Metadata } from 'next'
import { deleteSectorAction, saveSectorAction } from '@/backend/actions/content'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { listSectorsAdmin, listServicesAdmin } from '@/backend/modules/content/repository'
import { SectorsAdminView } from '@/frontend/views/admin/SectorsAdminView'

export const metadata: Metadata = { title: 'Secteurs d’intervention' }

export default async function SectorsAdminPage() {
  await requireAdmin('editContent')
  const sql = requireSql()
  const [sectors, services] = await Promise.all([listSectorsAdmin(sql), listServicesAdmin(sql)])
  return (
    <SectorsAdminView
      sectors={sectors.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        icon: s.icon,
        challenge: s.challenge,
        approach: s.approach,
        examples: s.examples,
        position: s.position,
        published: s.is_published,
        serviceIds: s.serviceIds,
      }))}
      services={services.map((s) => ({ id: s.id, name: s.name }))}
      save={saveSectorAction}
      remove={deleteSectorAction}
    />
  )
}
