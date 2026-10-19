import type { Metadata } from 'next'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { fetchSettingsRow, listClaimsAdmin } from '@/backend/modules/content/repository'
import { dashboardStats, listLeads } from '@/backend/modules/leads/repository'
import { DashboardView } from '@/frontend/views/admin/DashboardView'

// Page protégée : elle vérifie la session avant de s'afficher (navigation bloquante assumée).
export const instant = false

export const metadata: Metadata = { title: 'Tableau de bord' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function DashboardPage({ searchParams }: Props) {
  const { user } = await requireAdmin()
  const sql = requireSql()
  const [sp, stats, recent, settings, claims] = await Promise.all([
    searchParams,
    dashboardStats(sql),
    listLeads(sql, {}, null, 5),
    fetchSettingsRow(sql),
    listClaimsAdmin(sql),
  ])
  return (
    <DashboardView
      user={user}
      stats={stats}
      recent={recent.items}
      settings={settings}
      claims={claims.map(({ updatedAt: _u, ...c }) => c)}
      now={Date.now()}
      notice={sp.acces === 'refuse' ? 'acces-refuse' : sp.bienvenue === '1' ? 'bienvenue' : null}
    />
  )
}
