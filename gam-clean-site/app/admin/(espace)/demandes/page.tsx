import type { Metadata } from 'next'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { listServicesAdmin } from '@/backend/modules/content/repository'
import { countByStatus, listLeads } from '@/backend/modules/leads/repository'
import { listAssignableUsers } from '@/backend/modules/users/repository'
import { LeadsView } from '@/frontend/views/admin/LeadsView'
import { parseLeadFilters } from '@/shared/validation/filters'

// Page protégée : elle vérifie la session avant de s'afficher (navigation bloquante assumée).
export const instant = false

export const metadata: Metadata = { title: 'Demandes' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function LeadsPage({ searchParams }: Props) {
  await requireAdmin('manageLeads')
  const sql = requireSql()
  const sp = await searchParams
  const filters = parseLeadFilters(sp)
  const cursor = typeof sp.apres === 'string' ? sp.apres : null
  const [page, counts, services, assignees] = await Promise.all([
    listLeads(sql, filters, cursor),
    countByStatus(sql),
    listServicesAdmin(sql),
    listAssignableUsers(sql),
  ])
  return (
    <LeadsView
      page={page}
      filters={filters}
      cursor={cursor}
      counts={counts}
      services={services.map((s) => ({ id: s.id, name: s.name }))}
      assignees={assignees}
      now={Date.now()}
      notice={sp.supprimee === '1' ? 'supprimee' : sp.erreur ? 'erreur' : null}
    />
  )
}
