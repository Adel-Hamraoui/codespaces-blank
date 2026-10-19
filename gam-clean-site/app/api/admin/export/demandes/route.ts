// ============================================================================
// GET /api/admin/export/demandes — export CSV des demandes (mêmes filtres que
// la liste du back-office). Réservé aux comptes connectés.
// ============================================================================
import type { NextRequest } from 'next/server'
import { getSql } from '@/backend/db/client'
import { audit } from '@/backend/modules/audit/log'
import { authorize } from '@/backend/modules/auth/guard'
import { leadsToCsv } from '@/backend/modules/leads/csv'
import { exportLeads } from '@/backend/modules/leads/repository'
import { parseLeadFilters } from '@/shared/validation/filters'

export async function GET(req: NextRequest) {
  const user = await authorize('manageLeads')
  if (!user) return new Response('Accès refusé.', { status: 401 })
  const sql = getSql()
  if (!sql) return new Response('Base de données non configurée.', { status: 503 })

  const filters = parseLeadFilters(Object.fromEntries(req.nextUrl.searchParams))
  const rows = await exportLeads(sql, filters)
  await audit(sql, user.id, 'lead.export', { type: 'lead' }, { count: rows.length, filters })

  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date())
  return new Response(leadsToCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="demandes-gam-clean-${day}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
