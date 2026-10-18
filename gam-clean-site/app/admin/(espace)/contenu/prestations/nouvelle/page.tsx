import type { Metadata } from 'next'
import { deleteServiceAction, saveServiceAction } from '@/backend/actions/content'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { listServicesAdmin } from '@/backend/modules/content/repository'
import { ServiceEditorView } from '@/frontend/views/admin/ServiceEditorView'

export const metadata: Metadata = { title: 'Nouvelle prestation' }

export default async function NewServicePage() {
  await requireAdmin('editContent')
  const others = await listServicesAdmin(requireSql())
  return (
    <ServiceEditorView
      service={null}
      others={others.map((s) => ({ id: s.id, name: s.name }))}
      created={false}
      save={saveServiceAction}
      remove={deleteServiceAction}
    />
  )
}
