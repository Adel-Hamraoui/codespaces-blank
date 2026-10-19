// ============================================================================
// Avis clients : invitation par lien personnel, dépôt, modération.
// ============================================================================
import 'server-only'
import { getSql, requireSql, withActor } from '../../db/client'
import { sendReviewInvitation } from '../../integrations/email'
import { isRateLimited } from '../../security/rate-limit'
import { isTokenFormat, newToken, sha256 } from '../../security/tokens'
import { getSiteChrome } from '../content/public'
import { addEvent } from '../leads/repository'
import { audit } from '../audit/log'
import { findOpenRequest, insertRequest, insertReview, type OpenRequest } from './repository'
import { absoluteUrl } from '@/shared/config/site-url'
import type { FieldErrors } from '@/shared/validation/common'
import type { ReviewInput, ReviewRequestInput } from '@/shared/validation/review'

/** Invitation encore valide pour ce jeton (page publique /avis/[jeton]). */
export async function getOpenInvitation(token: string): Promise<OpenRequest | null> {
  const sql = getSql()
  if (!sql || !isTokenFormat(token)) return null
  return findOpenRequest(sql, sha256(token))
}

export async function createInvitation(d: ReviewRequestInput, actorId: number) {
  const token = newToken()
  const link = absoluteUrl(`/avis/${token}`)
  const id = await withActor(actorId, async (tx) => {
    const requestId = await insertRequest(tx, { ...d, tokenHash: sha256(token), createdBy: actorId })
    if (d.leadId) await addEvent(tx, d.leadId, 'review_request', `Invitation à laisser un avis créée pour ${d.clientName}.`, actorId)
    await audit(tx, actorId, 'review.invite', { type: 'review_request', id: requestId }, { leadId: d.leadId, emailed: d.sendEmail })
    return requestId
  })
  let emailed = false
  if (d.sendEmail && d.clientEmail) {
    const { settings } = await getSiteChrome()
    emailed = (await sendReviewInvitation(d.clientEmail, d.clientName, link, settings)).sent
  }
  return { id, link, emailed }
}

export type SubmitReviewResult = { status: 'ok' } | { status: 'invalid'; errors: FieldErrors } | { status: 'expired' } | { status: 'rate_limited' }

export async function submitReview(token: string, data: ReviewInput, ip: string): Promise<SubmitReviewResult> {
  if (await isRateLimited('avis', ip, 10, 3600)) return { status: 'rate_limited' }
  if (!isTokenFormat(token)) return { status: 'expired' }
  const sql = requireSql()
  return sql.begin(async (tx) => {
    // Verrou sur l'invitation : deux envois simultanés ne peuvent pas créer deux avis.
    const request = await findOpenRequest(tx, sha256(token), true)
    if (!request) return { status: 'expired' } as const
    const reviewId = await insertReview(tx, request.id, data)
    await audit(tx, null, 'review.submit', { type: 'review', id: reviewId }, { rating: data.rating, consent: data.consentPublish })
    return { status: 'ok' } as const
  }) as Promise<SubmitReviewResult>
}
