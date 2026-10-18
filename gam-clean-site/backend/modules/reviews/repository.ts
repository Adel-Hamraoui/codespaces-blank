// ============================================================================
// Avis clients et invitations — accès aux données.
// ============================================================================
import 'server-only'
import type { Sql, Tx } from '../../db/client'
import type { ReviewStatus } from '@/shared/constants'
import type { ReviewRequestRow, ReviewRow } from '@/shared/types/admin'
import type { ReviewInput } from '@/shared/validation/review'

const INVITATION_DAYS = 60

export async function insertRequest(
  tx: Tx | Sql,
  d: { clientName: string; clientEmail: string | null; leadId: string | null; tokenHash: Buffer; createdBy: number }
) {
  const [r] = await tx<{ id: string }[]>`
    insert into gam.review_requests (client_name, client_email, lead_id, token_hash, created_by, expires_at)
    values (${d.clientName}, ${d.clientEmail}, ${d.leadId}::bigint, ${d.tokenHash}, ${d.createdBy},
            now() + make_interval(days => ${INVITATION_DAYS}))
    returning id::text as id`
  return r.id
}

export type OpenRequest = { id: string; clientName: string; expiresAt: Date; leadServiceSlugs: string[] }

/** Invitation valide (non utilisée, non expirée) correspondant à l'empreinte du jeton. */
export async function findOpenRequest(sql: Sql | Tx, tokenHash: Buffer, lock = false): Promise<OpenRequest | null> {
  const [r] = await sql<OpenRequest[]>`
    select rr.id::text as id, rr.client_name as "clientName", rr.expires_at as "expiresAt",
           coalesce((select array_agg(v.slug) from gam.lead_services ls join gam.services v on v.id = ls.service_id
                     where ls.lead_id = rr.lead_id), '{}') as "leadServiceSlugs"
    from gam.review_requests rr
    where rr.token_hash = ${tokenHash} and rr.used_at is null and rr.expires_at > now()
    ${lock ? sql`for update of rr` : sql``}`
  return r ?? null
}

export async function insertReview(tx: Tx, requestId: string, d: ReviewInput) {
  const [service] = d.serviceSlug
    ? await tx<{ id: number }[]>`select id from gam.services where slug = ${d.serviceSlug} and is_published`
    : []
  const [r] = await tx<{ id: string }[]>`
    insert into gam.reviews (request_id, service_id, rating, rating_quality, rating_punctuality, rating_communication,
                             consent_publish, author_name, author_company, comment)
    values (${requestId}::bigint, ${service?.id ?? null}, ${d.rating}, ${d.ratingQuality}, ${d.ratingPunctuality},
            ${d.ratingCommunication}, ${d.consentPublish}, ${d.authorName}, ${d.authorCompany}, ${d.comment})
    returning id::text as id`
  await tx`update gam.review_requests set used_at = now() where id = ${requestId}::bigint`
  return r.id
}

type ReviewDbRow = Omit<ReviewRow, 'createdAt' | 'moderatedAt'> & { createdAt: Date; moderatedAt: Date | null }

export async function listReviews(sql: Sql, status: ReviewStatus | null, limit = 100): Promise<ReviewRow[]> {
  const rows = await sql<ReviewDbRow[]>`
    select r.id::text as id, r.created_at as "createdAt", r.status, r.rating, r.rating_quality as "ratingQuality",
           r.rating_punctuality as "ratingPunctuality", r.rating_communication as "ratingCommunication",
           r.consent_publish as "consentPublish", r.author_name as "authorName", r.author_company as "authorCompany",
           r.comment, v.name as "serviceName", r.moderated_at as "moderatedAt", u.display_name as "moderatorName",
           r.rejection_reason as "rejectionReason"
    from gam.reviews r
    left join gam.services v on v.id = r.service_id
    left join gam.admin_users u on u.id = r.moderated_by
    ${status ? sql`where r.status = ${status}` : sql``}
    order by r.created_at desc, r.id desc
    limit ${limit}`
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), moderatedAt: r.moderatedAt?.toISOString() ?? null }))
}

export async function countReviewsByStatus(sql: Sql): Promise<Record<ReviewStatus, number>> {
  const rows = await sql<{ status: ReviewStatus; n: number }[]>`select status, count(*)::int as n from gam.reviews group by status`
  const out = { pending: 0, published: 0, rejected: 0 } as Record<ReviewStatus, number>
  for (const r of rows) out[r.status] = r.n
  return out
}

export async function listRequests(sql: Sql, limit = 50): Promise<ReviewRequestRow[]> {
  const rows = await sql<(Omit<ReviewRequestRow, 'createdAt' | 'expiresAt' | 'usedAt'> & { createdAt: Date; expiresAt: Date; usedAt: Date | null })[]>`
    select rr.id::text as id, rr.created_at as "createdAt", rr.expires_at as "expiresAt", rr.used_at as "usedAt",
           rr.client_name as "clientName", rr.client_email as "clientEmail", rr.lead_id::text as "leadId",
           u.display_name as "createdByName"
    from gam.review_requests rr
    left join gam.admin_users u on u.id = rr.created_by
    order by rr.created_at desc
    limit ${limit}`
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt.toISOString(),
    usedAt: r.usedAt?.toISOString() ?? null,
  }))
}

/** Modération. La contrainte reviews_publish_requires_consent refuse toute publication sans consentement. */
export async function moderateReview(tx: Tx, id: string, status: ReviewStatus, reason: string | null) {
  const rows = await tx`
    update gam.reviews set status = ${status}, rejection_reason = ${status === 'rejected' ? reason : null}
    where id = ${id}::bigint returning id`
  return rows.length > 0
}

export async function deleteReview(tx: Tx, id: string) {
  return (await tx`delete from gam.reviews where id = ${id}::bigint returning id`).length > 0
}

export async function deleteRequest(tx: Tx, id: string) {
  return (await tx`delete from gam.review_requests where id = ${id}::bigint and used_at is null returning id`).length > 0
}
