import type { Metadata } from 'next'
import { deleteFaqAction, saveFaqAction } from '@/backend/actions/content'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { listFaqAdmin, listServicesAdmin } from '@/backend/modules/content/repository'
import { FaqAdminView } from '@/frontend/views/admin/FaqAdminView'

export const metadata: Metadata = { title: 'Questions fréquentes' }

export default async function FaqAdminPage() {
  await requireAdmin('editContent')
  const sql = requireSql()
  const [items, services] = await Promise.all([listFaqAdmin(sql), listServicesAdmin(sql)])
  return (
    <FaqAdminView
      items={items.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        position: f.position,
        published: f.is_published,
        serviceId: f.service_id,
        serviceName: f.service_name,
      }))}
      services={services.map((s) => ({ id: s.id, name: s.name }))}
      save={saveFaqAction}
      remove={deleteFaqAction}
    />
  )
}
