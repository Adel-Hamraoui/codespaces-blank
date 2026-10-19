import type { Metadata } from 'next'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { listServicesAdmin } from '@/backend/modules/content/repository'
import { ServicesAdminView } from '@/frontend/views/admin/ServicesAdminView'

// Page protégée : elle vérifie la session avant de s'afficher (navigation bloquante assumée).
export const instant = false

export const metadata: Metadata = { title: 'Prestations' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ServicesAdminPage({ searchParams }: Props) {
  await requireAdmin('editContent')
  const [rows, sp] = await Promise.all([listServicesAdmin(requireSql()), searchParams])
  return (
    <ServicesAdminView
      deleted={sp.supprimee === '1'}
      services={rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        icon: r.icon,
        position: r.position,
        featured: r.is_featured,
        published: r.is_published,
        faqCount: r.faq_count,
        leadCount: r.lead_count,
      }))}
    />
  )
}
