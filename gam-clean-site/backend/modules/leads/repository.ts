// ============================================================================
// Demandes (leads) — accès aux données.
// Pagination par curseur (keyset) sur (created_at, id) : coût constant quelle
// que soit la page, contrairement à OFFSET qui relit toutes les lignes sautées.
// ============================================================================
import 'server-only'
import type { PendingQuery, Row } from 'postgres'
import type { Sql, Tx } from '../../db/client'
import type { Frequency, LeadStatus, LeadType, Profile } from '@/shared/constants'
import type { DashboardStats, LeadDetail, LeadEvent, LeadFilters, LeadListItem, Page } from '@/shared/types/admin'
import type { ValidRequest } from '@/shared/validation/request'

type Fragment = PendingQuery<Row[]>

const ISO_US = `'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'`

// ---------------------------------------------------------------------------
// Curseur opaque : horodatage à la microseconde + identifiant
// ---------------------------------------------------------------------------
export function encodeCursor(ts: string, id: string) {
  return Buffer.from(`${ts}|${id}`).toString('base64url')
}

export function decodeCursor(cursor: string | null | undefined): { ts: string; id: string } | null {
  if (!cursor) return null
  try {
    const [ts, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|')
    if (!/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(ts) || !/^\d{1,18}$/.test(id)) return null
    return { ts, id }
  } catch {
    return null
  }
}

/** Échappe %, _ et \ pour une recherche LIKE littérale. */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)

function whereClause(sql: Sql, f: LeadFilters): Fragment {
  const conds: Fragment[] = []
  if (f.status) conds.push(sql`l.status = ${f.status}`)
  if (f.type) conds.push(sql`l.type = ${f.type}`)
  if (f.assignedToId) conds.push(sql`l.assigned_to = ${f.assignedToId}`)
  if (f.serviceId) {
    conds.push(sql`exists (select 1 from gam.lead_services s where s.lead_id = l.id and s.service_id = ${f.serviceId})`)
  }
  if (f.q && f.q.trim().length >= 2) {
    // Même expression que l'index leads_search_trgm_idx (sinon l'index ne serait pas utilisé).
    conds.push(sql`gam.lead_search_document(l.name, l.email, l.company, l.location, l.phone_e164)
      like '%' || gam.normalize_search(${escapeLike(f.q.trim().slice(0, 80))}) || '%'`)
  }
  if (f.from) conds.push(sql`l.created_at >= (${f.from}::date::timestamp at time zone 'Europe/Paris')`)
  if (f.to) conds.push(sql`l.created_at < ((${f.to}::date + 1)::timestamp at time zone 'Europe/Paris')`)
  if (conds.length === 0) return sql`true`
  return conds.reduce((acc, c) => sql`${acc} and ${c}`)
}

const LIST_COLUMNS = (sql: Sql) => sql`
  l.id::text as id,
  to_char(l.created_at at time zone 'UTC', ${sql.unsafe(ISO_US)}) as "cursorTs",
  l.created_at as "createdAt", l.type, l.status, l.name, l.company, l.email,
  l.phone_e164 as phone, l.location, l.other_need as "otherNeed",
  (l.notified_at is not null) as notified,
  u.display_name as "assignedTo",
  coalesce((select array_agg(v.name order by v.position) from gam.lead_services ls
            join gam.services v on v.id = ls.service_id where ls.lead_id = l.id), '{}') as "serviceNames"`

type ListRow = Omit<LeadListItem, 'createdAt'> & { createdAt: Date; cursorTs: string }

const toItem = ({ cursorTs: _c, createdAt, ...r }: ListRow): LeadListItem => ({ ...r, createdAt: createdAt.toISOString() })

export async function listLeads(sql: Sql, f: LeadFilters, cursor: string | null, limit = 25): Promise<Page<LeadListItem>> {
  const after = decodeCursor(cursor)
  const rows = await sql<ListRow[]>`
    select ${LIST_COLUMNS(sql)}
    from gam.leads l
    left join gam.admin_users u on u.id = l.assigned_to
    where ${whereClause(sql, f)}
      ${after ? sql`and (l.created_at, l.id) < (${after.ts}::timestamptz, ${after.id}::bigint)` : sql``}
    order by l.created_at desc, l.id desc
    limit ${limit + 1}`
  const hasMore = rows.length > limit
  const page = rows.slice(0, limit)
  const last = page[page.length - 1]
  return {
    items: page.map(toItem),
    nextCursor: hasMore && last ? encodeCursor(last.cursorTs, last.id) : null,
  }
}

/** Export CSV : mêmes filtres, plafonné. */
export async function exportLeads(sql: Sql, f: LeadFilters, max = 5000) {
  return sql<(ListRow & { message: string | null; frequency: Frequency | null; profile: Profile | null; surfaceM2: number | null })[]>`
    select ${LIST_COLUMNS(sql)}, l.message, l.frequency, l.profile, l.surface_m2 as "surfaceM2"
    from gam.leads l
    left join gam.admin_users u on u.id = l.assigned_to
    where ${whereClause(sql, f)}
    order by l.created_at desc, l.id desc
    limit ${max}`
}

export async function countByStatus(sql: Sql): Promise<Record<LeadStatus, number>> {
  const rows = await sql<{ status: LeadStatus; n: number }[]>`
    select status, count(*)::int as n from gam.leads group by status`
  const out = { new: 0, in_progress: 0, quote_sent: 0, won: 0, lost: 0, spam: 0 } as Record<LeadStatus, number>
  for (const r of rows) out[r.status] = r.n
  return out
}

/** Nombre de demandes « nouvelles » (badge du menu, sur chaque page du back-office) :
 *  lecture de l'index (status, created_at, id) seul, sans toucher à la table. */
export async function countNewLeads(sql: Sql): Promise<number> {
  const [r] = await sql<{ n: number }[]>`select count(*)::int as n from gam.leads where status = 'new'`
  return r.n
}

/**
 * Indicateurs du tableau de bord en UN SEUL passage sur la table des demandes
 * (agrégats filtrés) : la répartition par statut impose de toute façon de lire
 * chaque ligne, les autres compteurs s'y ajoutent sans lecture supplémentaire.
 */
export async function dashboardStats(sql: Sql): Promise<DashboardStats> {
  const [r] = await sql<{
    new: number
    in_progress: number
    quote_sent: number
    won: number
    lost: number
    spam: number
    last30: number
    prev30: number
    won90: number
    closed90: number
    unnotified: number
    pending_reviews: number
    published_reviews: number
  }[]>`
    select
      count(*) filter (where status = 'new')::int as new,
      count(*) filter (where status = 'in_progress')::int as in_progress,
      count(*) filter (where status = 'quote_sent')::int as quote_sent,
      count(*) filter (where status = 'won')::int as won,
      count(*) filter (where status = 'lost')::int as lost,
      count(*) filter (where status = 'spam')::int as spam,
      count(*) filter (where created_at >= now() - interval '30 days')::int as last30,
      count(*) filter (where created_at >= now() - interval '60 days' and created_at < now() - interval '30 days')::int as prev30,
      count(*) filter (where status = 'won' and status_changed_at >= now() - interval '90 days')::int as won90,
      count(*) filter (where status in ('won', 'lost') and status_changed_at >= now() - interval '90 days')::int as closed90,
      count(*) filter (where notified_at is null)::int as unnotified,
      (select count(*)::int from gam.reviews where status = 'pending') as pending_reviews,
      (select count(*)::int from gam.reviews where status = 'published') as published_reviews
    from gam.leads`
  return {
    byStatus: { new: r.new, in_progress: r.in_progress, quote_sent: r.quote_sent, won: r.won, lost: r.lost, spam: r.spam },
    last30Days: r.last30,
    previous30Days: r.prev30,
    won90Days: r.won90,
    closed90Days: r.closed90,
    pendingReviews: r.pending_reviews,
    publishedReviews: r.published_reviews,
    unnotified: r.unnotified,
  }
}

export async function getLead(sql: Sql, id: string): Promise<LeadDetail | null> {
  if (!/^\d{1,18}$/.test(id)) return null
  const [row] = await sql<(ListRow & {
    updatedAt: Date
    statusChangedAt: Date
    notifiedAt: Date | null
    frequency: Frequency | null
    profile: Profile | null
    surfaceM2: number | null
    message: string | null
    sourcePath: string | null
    assignedToId: number | null
  })[]>`
    select ${LIST_COLUMNS(sql)}, l.updated_at as "updatedAt", l.status_changed_at as "statusChangedAt",
           l.notified_at as "notifiedAt", l.frequency, l.profile, l.surface_m2 as "surfaceM2", l.message,
           l.source_path as "sourcePath", l.assigned_to as "assignedToId"
    from gam.leads l
    left join gam.admin_users u on u.id = l.assigned_to
    where l.id = ${id}::bigint`
  if (!row) return null
  const events = await sql<(Omit<LeadEvent, 'createdAt'> & { createdAt: Date })[]>`
    select e.id::text as id, e.created_at as "createdAt", e.kind, e.from_status as "fromStatus",
           e.to_status as "toStatus", a.display_name as "actorName", s.display_name as "assigneeName", e.body
    from gam.lead_events e
    left join gam.admin_users a on a.id = e.actor_id
    left join gam.admin_users s on s.id = e.assignee_id
    where e.lead_id = ${id}::bigint
    order by e.created_at desc, e.id desc`
  const { updatedAt, statusChangedAt, notifiedAt, ...rest } = row
  return {
    ...toItem(rest),
    updatedAt: updatedAt.toISOString(),
    statusChangedAt: statusChangedAt.toISOString(),
    notifiedAt: notifiedAt ? notifiedAt.toISOString() : null,
    frequency: rest.frequency,
    profile: rest.profile,
    surfaceM2: rest.surfaceM2,
    message: rest.message,
    sourcePath: rest.sourcePath,
    assignedToId: rest.assignedToId,
    events: events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
  }
}

// ---------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------
const TYPE_DB: Record<ValidRequest['type'], LeadType> = { devis: 'quote', contact: 'contact' }

/** Identifiants des prestations publiées correspondant aux adresses demandées. */
export async function resolveServiceIds(sql: Sql | Tx, slugs: string[]): Promise<number[]> {
  if (slugs.length === 0) return []
  const rows = await sql<{ id: number }[]>`
    select id from gam.services where is_published and slug in ${sql(slugs)}`
  return rows.map((r) => r.id)
}

export async function insertLead(tx: Tx, d: ValidRequest, serviceIds: number[]): Promise<string> {
  const [row] = await tx<{ id: string }[]>`
    insert into gam.leads (type, name, company, email, phone_e164, location, surface_m2, frequency,
                           profile, message, source_path, other_need)
    values (${TYPE_DB[d.type]}, ${d.name}, ${d.company || null}, ${d.email}, ${d.phoneE164},
            ${d.location || null}, ${d.surfaceM2}, ${d.frequency || null}, ${d.profile || null},
            ${d.message || null}, ${d.sourcePath || null}, ${d.otherNeed})
    returning id::text as id`
  if (serviceIds.length > 0) {
    const rows = serviceIds.map((service_id) => ({ lead_id: row.id, service_id }))
    await tx`insert into gam.lead_services ${tx(rows)} on conflict do nothing`
  }
  return row.id
}

export async function recordNotification(sql: Sql, id: string, sent: boolean) {
  await sql`
    update gam.leads set
      notified_at = case when ${sent} then now() else notified_at end,
      notify_attempts = notify_attempts + 1
    where id = ${id}::bigint`
}

export async function pendingNotifications(sql: Sql, limit = 20) {
  return sql<{ id: string }[]>`
    select id::text as id from gam.leads
    where notified_at is null and notify_attempts < 5 and created_at > now() - interval '7 days'
    order by created_at
    limit ${limit}`
}

/** Données complètes d'une demande pour renvoyer sa notification. */
export async function leadForNotification(sql: Sql, id: string): Promise<ValidRequest | null> {
  const [r] = await sql`
    select l.type, l.name, l.company, l.email, l.phone_e164, l.location, l.surface_m2, l.frequency, l.profile,
           l.message, l.source_path, l.other_need,
           coalesce((select array_agg(v.slug) from gam.lead_services ls join gam.services v on v.id = ls.service_id
                     where ls.lead_id = l.id), '{}') as slugs
    from gam.leads l where l.id = ${id}::bigint`
  if (!r) return null
  return {
    type: r.type === 'quote' ? 'devis' : 'contact',
    name: r.name,
    company: r.company ?? '',
    email: r.email,
    phoneE164: r.phone_e164,
    location: r.location ?? '',
    surfaceM2: r.surface_m2,
    frequency: r.frequency ?? '',
    profile: r.profile ?? '',
    message: r.message ?? '',
    sourcePath: r.source_path ?? '',
    otherNeed: r.other_need,
    serviceSlugs: r.slugs,
  }
}

export async function updateStatus(tx: Tx, id: string, status: LeadStatus) {
  return (await tx`update gam.leads set status = ${status} where id = ${id}::bigint and status <> ${status} returning id`).length > 0
}

export async function assignLead(tx: Tx, id: string, userId: number | null) {
  return (await tx`
    update gam.leads set assigned_to = ${userId}
    where id = ${id}::bigint and assigned_to is distinct from ${userId}::smallint returning id`).length > 0
}

export async function addNote(tx: Tx, id: string, body: string, actorId: number) {
  const [lead] = await tx`update gam.leads set updated_at = now() where id = ${id}::bigint returning id`
  if (!lead) return false
  await tx`insert into gam.lead_events (lead_id, kind, actor_id, body) values (${id}::bigint, 'note', ${actorId}, ${body})`
  return true
}

export async function addEvent(sql: Sql | Tx, id: string, kind: 'notification' | 'review_request', body: string, actorId: number | null) {
  await sql`insert into gam.lead_events (lead_id, kind, actor_id, body) values (${id}::bigint, ${kind}, ${actorId}, ${body})`
}

export async function deleteLead(tx: Tx, id: string) {
  return (await tx`delete from gam.leads where id = ${id}::bigint returning id`).length > 0
}
