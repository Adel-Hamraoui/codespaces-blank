'use server'
// ============================================================================
// Demandes : statut, assignation, notes, suppression.
// ============================================================================
import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { withActor } from '../db/client'
import { authorize } from '../modules/auth/guard'
import { audit } from '../modules/audit/log'
import { addNote, assignLead, deleteLead, updateStatus } from '../modules/leads/repository'
import { LEAD_STATUSES } from '@/shared/constants'
import type { ActionState } from '@/shared/types/admin'
import { isOneOf, str } from '@/shared/validation/common'

const DENIED: ActionState = { ok: false, message: 'Action non autorisée pour votre compte.' }
const leadId = (fd: FormData) => {
  const id = String(fd.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

export async function updateLeadStatusAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('manageLeads')
  if (!user) return DENIED
  const id = leadId(fd)
  const status = fd.get('status')
  if (!id || !isOneOf(LEAD_STATUSES, status)) return { ok: false, message: 'Statut invalide.' }
  const changed = await withActor(user.id, async (tx) => {
    const ok = await updateStatus(tx, id, status)
    if (ok) await audit(tx, user.id, 'lead.status', { type: 'lead', id }, { status })
    return ok
  })
  refresh()
  return { ok: true, message: changed ? 'Statut mis à jour.' : 'Statut inchangé.' }
}

export async function assignLeadAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('manageLeads')
  if (!user) return DENIED
  const id = leadId(fd)
  const raw = Number(fd.get('assignee'))
  const assignee = Number.isInteger(raw) && raw > 0 ? raw : null
  if (!id) return { ok: false, message: 'Demande introuvable.' }
  try {
    await withActor(user.id, async (tx) => {
      if (await assignLead(tx, id, assignee)) await audit(tx, user.id, 'lead.assign', { type: 'lead', id }, { assignee })
    })
  } catch {
    return { ok: false, message: 'Cette personne n’existe pas ou n’est plus active.' }
  }
  refresh()
  return { ok: true, message: assignee ? 'Demande assignée.' : 'Assignation retirée.' }
}

export async function addLeadNoteAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('manageLeads')
  if (!user) return DENIED
  const id = leadId(fd)
  const body = str(fd.get('body'), 2000)
  if (!id) return { ok: false, message: 'Demande introuvable.' }
  if (body.length < 2) return { ok: false, fieldErrors: { body: 'Écrivez une note.' } }
  await withActor(user.id, (tx) => addNote(tx, id, body, user.id))
  refresh()
  return { ok: true, message: 'Note ajoutée.' }
}

export async function deleteLeadAction(fd: FormData) {
  const user = await authorize('deleteLeads')
  const id = leadId(fd)
  if (!user || !id) redirect('/admin/demandes?erreur=suppression')
  await withActor(user.id, async (tx) => {
    if (await deleteLead(tx, id)) await audit(tx, user.id, 'lead.delete', { type: 'lead', id })
  })
  redirect('/admin/demandes?supprimee=1')
}
