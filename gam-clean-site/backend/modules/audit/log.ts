// ============================================================================
// Journal d'audit : qui a fait quoi, quand (responsabilité RGPD, sécurité).
// ============================================================================
import 'server-only'
import type { Sql, Tx } from '../../db/client'
import type { AuditEntry } from '@/shared/types/admin'

export async function audit(
  sql: Sql | Tx,
  actorId: number | null,
  action: string,
  entity: { type?: string; id?: string | number } = {},
  details?: Record<string, unknown>
) {
  await sql`
    insert into gam.audit_log (actor_id, action, entity_type, entity_id, details)
    values (${actorId}, ${action}, ${entity.type ?? null}, ${entity.id === undefined ? null : String(entity.id)},
            ${details ? sql.json(details as never) : null})`
}

export async function listAudit(sql: Sql, beforeId: string | null, limit = 50): Promise<{ items: AuditEntry[]; nextBefore: string | null }> {
  const rows = await sql<(Omit<AuditEntry, 'createdAt'> & { createdAt: Date })[]>`
    select a.id::text as id, a.created_at as "createdAt", u.display_name as "actorName", a.action,
           a.entity_type as "entityType", a.entity_id as "entityId", a.details
    from gam.audit_log a
    left join gam.admin_users u on u.id = a.actor_id
    ${beforeId && /^\d{1,18}$/.test(beforeId) ? sql`where a.id < ${beforeId}::bigint` : sql``}
    order by a.id desc
    limit ${limit + 1}`
  const items = rows.slice(0, limit).map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
  return { items, nextBefore: rows.length > limit ? items[items.length - 1].id : null }
}
