// ============================================================================
// Réception d'une demande publique (devis ou contact).
// ----------------------------------------------------------------------------
// Ordre : anti-abus → validation → enregistrement en base → notification e-mail.
// La demande est considérée comme reçue si elle est enregistrée OU notifiée :
// un e-mail en échec est renvoyé automatiquement par la maintenance quotidienne.
// ============================================================================
import 'server-only'
import { getSql } from '../../db/client'
import { notifyNewLead, sendCustomerConfirmation } from '../../integrations/email'
import { isRateLimited } from '../../security/rate-limit'
import { getSiteChrome } from '../content/public'
import { insertLead, recordNotification, resolveServiceIds } from './repository'
import { absoluteUrl } from '@/shared/config/site-url'
import type { FieldErrors } from '@/shared/validation/common'
import { sanitizeRequest, validateRequest, type RequestField } from '@/shared/validation/request'

export type SubmitResult =
  | { status: 'ok'; leadId: string | null }
  | { status: 'invalid'; errors: FieldErrors<RequestField> }
  | { status: 'rate_limited' }
  | { status: 'spam' }
  | { status: 'failed' }

const MIN_FILL_TIME_MS = 3_000

export async function submitLead(input: Record<string, unknown>, ctx: { ip: string }): Promise<SubmitResult> {
  if (await isRateLimited('demande', ctx.ip, 5, 600)) return { status: 'rate_limited' }

  // Anti-spam : champ piège rempli ou formulaire envoyé trop vite après son affichage.
  const honeypot = typeof input.website === 'string' && input.website.trim() !== ''
  const startedAt = Number(input.startedAt)
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_TIME_MS
  if (honeypot || tooFast) {
    console.warn('[demande] Envoi ignoré (anti-spam)', { honeypot, tooFast })
    return { status: 'spam' }
  }

  const chrome = await getSiteChrome()
  const { errors, data } = validateRequest(sanitizeRequest(input, chrome.services.map((s) => s.slug)))
  if (!data) return { status: 'invalid', errors }

  let leadId: string | null = null
  const sql = getSql()
  if (sql) {
    try {
      leadId = await sql.begin(async (tx) => insertLead(tx, data, await resolveServiceIds(tx, data.serviceSlugs)))
    } catch (error) {
      console.error('[demande] Enregistrement en base impossible, envoi par e-mail uniquement.', error)
    }
  }

  const serviceNames = chrome.services.filter((s) => data.serviceSlugs.includes(s.slug)).map((s) => s.name)
  const mail = await notifyNewLead(data, serviceNames, chrome.settings, leadId ? absoluteUrl(`/admin/demandes/${leadId}`) : null)
  if (leadId && sql) {
    await recordNotification(sql, leadId, mail.sent).catch((e) => console.error('[demande] Suivi de notification', e))
  }
  if (mail.sent) await sendCustomerConfirmation(data, chrome.settings)

  if (leadId || mail.sent) return { status: 'ok', leadId }
  return { status: 'failed' }
}
