'use server'
// ============================================================================
// Avis clients : invitations, modération, dépôt public.
// ============================================================================
import { headers } from 'next/headers'
import { refresh, updateTag } from 'next/cache'
import { pgCode, withActor } from '../db/client'
import { authorize } from '../modules/auth/guard'
import { audit } from '../modules/audit/log'
import { REVIEWS_TAG } from '../modules/content/tags'
import { deleteRequest, deleteReview, moderateReview } from '../modules/reviews/repository'
import { createInvitation, submitReview } from '../modules/reviews/service'
import { clientIp } from '../security/rate-limit'
import { REVIEW_STATUSES } from '@/shared/constants'
import type { ActionState, InvitationState } from '@/shared/types/admin'
import { isOneOf, optStr } from '@/shared/validation/common'
import { validateReview, validateReviewRequest } from '@/shared/validation/review'

const DENIED: ActionState = { ok: false, message: 'Action non autorisée pour votre compte.' }
const idOf = (fd: FormData) => {
  const id = String(fd.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

export async function createInvitationAction(_prev: InvitationState, fd: FormData): Promise<InvitationState> {
  const user = await authorize('manageLeads')
  if (!user) return DENIED
  const { data, errors } = validateReviewRequest(Object.fromEntries(fd))
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors }
  const { link, emailed } = await createInvitation(data, user.id)
  refresh()
  return {
    ok: true,
    link,
    message: emailed
      ? `Invitation envoyée à ${data.clientEmail}. Le lien est aussi copiable ci-dessous.`
      : 'Lien créé : copiez-le et transmettez-le au client (valable 60 jours, une seule utilisation).',
  }
}

export async function moderateReviewAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('moderateReviews')
  if (!user) return DENIED
  const id = idOf(fd)
  const status = fd.get('status')
  if (!id || !isOneOf(REVIEW_STATUSES, status)) return { ok: false, message: 'Demande de modération invalide.' }
  try {
    await withActor(user.id, async (tx) => {
      if (await moderateReview(tx, id, status, optStr(fd.get('reason'), 300))) {
        await audit(tx, user.id, 'review.moderate', { type: 'review', id }, { status })
      }
    })
  } catch (error) {
    if (pgCode(error) === '23514') return { ok: false, message: 'Publication impossible : le client n’a pas autorisé la publication de son avis.' }
    throw error
  }
  updateTag(REVIEWS_TAG)
  refresh()
  return { ok: true, message: status === 'published' ? 'Avis publié sur le site.' : status === 'rejected' ? 'Avis refusé.' : 'Avis remis en attente.' }
}

export async function deleteReviewAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('moderateReviews')
  const id = idOf(fd)
  if (!user || !id) return DENIED
  await withActor(user.id, async (tx) => {
    if (await deleteReview(tx, id)) await audit(tx, user.id, 'review.delete', { type: 'review', id })
  })
  updateTag(REVIEWS_TAG)
  refresh()
  return { ok: true, message: 'Avis supprimé.' }
}

export async function deleteInvitationAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('manageLeads')
  const id = idOf(fd)
  if (!user || !id) return DENIED
  await withActor(user.id, async (tx) => {
    if (await deleteRequest(tx, id)) await audit(tx, user.id, 'review.invite_delete', { type: 'review_request', id })
  })
  refresh()
  return { ok: true, message: 'Invitation annulée.' }
}

/** Dépôt d'un avis par un client (page publique, protégée par le jeton personnel). */
export async function submitReviewAction(token: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const { data, errors } = validateReview(Object.fromEntries(fd))
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors }
  const result = await submitReview(token, data, clientIp(await headers()))
  if (result.status === 'ok') return { ok: true, message: 'Merci ! Votre avis a bien été enregistré.' }
  if (result.status === 'rate_limited') return { ok: false, message: 'Trop d’envois. Réessayez plus tard.' }
  if (result.status === 'expired') return { ok: false, message: 'Ce lien n’est plus valide (déjà utilisé ou expiré).' }
  return { ok: false, fieldErrors: result.errors }
}
