import type { Metadata } from 'next'
import { requireSql } from '@/backend/db/client'
import { listAudit } from '@/backend/modules/audit/log'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { AuditView } from '@/frontend/views/admin/AuditView'

// Page protégée : elle vérifie la session avant de s'afficher (navigation bloquante assumée).
export const instant = false

export const metadata: Metadata = { title: 'Journal' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function AuditPage({ searchParams }: Props) {
  await requireAdmin('viewAudit')
  const { avant } = await searchParams
  const before = typeof avant === 'string' ? avant : null
  const { items, nextBefore } = await listAudit(requireSql(), before)
  return <AuditView items={items} nextBefore={nextBefore} paged={before !== null} />
}
