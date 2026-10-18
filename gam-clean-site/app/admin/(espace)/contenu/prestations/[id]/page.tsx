import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { deleteServiceAction, saveServiceAction } from '@/backend/actions/content'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { fetchServiceForEdit, listServicesAdmin } from '@/backend/modules/content/repository'
import { ServiceEditorView } from '@/frontend/views/admin/ServiceEditorView'

export const metadata: Metadata = { title: 'Modifier une prestation' }

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function EditServicePage({ params, searchParams }: Props) {
  await requireAdmin('editContent')
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0 || numericId > 32767) notFound()
  const sql = requireSql()
  const [service, all] = await Promise.all([fetchServiceForEdit(sql, numericId), listServicesAdmin(sql)])
  if (!service) notFound()
  return (
    <ServiceEditorView
      service={service}
      others={all.filter((s) => s.id !== numericId).map((s) => ({ id: s.id, name: s.name }))}
      created={sp.cree === '1'}
      save={saveServiceAction}
      remove={deleteServiceAction}
    />
  )
}
