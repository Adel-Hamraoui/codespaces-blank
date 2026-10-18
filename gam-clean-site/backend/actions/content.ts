'use server'
// ============================================================================
// Contenus du site : coordonnées, affirmations, prestations, FAQ, secteurs.
// Chaque enregistrement invalide le cache public (updateTag) : la modification
// est visible immédiatement sur le site.
// ============================================================================
import { refresh, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { pgCode, withActor } from '../db/client'
import { authorize } from '../modules/auth/guard'
import { audit } from '../modules/audit/log'
import * as repo from '../modules/content/repository'
import { CONTENT_TAG } from '../modules/content/tags'
import type { ActionState } from '@/shared/types/admin'
import { validateClaim, validateFaq, validateSector, validateService, validateSettings } from '@/shared/validation/content'

const DENIED: ActionState = { ok: false, message: 'Action non autorisée pour votre compte.' }
const SAVED: ActionState = { ok: true, message: 'Modifications enregistrées et publiées sur le site.' }

/** FormData → objet, en conservant les champs multiples (cases à cocher). */
function formObject(fd: FormData, multi: string[] = []) {
  const o: Record<string, unknown> = Object.fromEntries(fd)
  for (const k of multi) o[k] = fd.getAll(k)
  return o
}

const numId = (fd: FormData) => {
  const n = Number(fd.get('id'))
  return Number.isInteger(n) && n > 0 ? n : null
}

function dbError(error: unknown): ActionState {
  const code = pgCode(error)
  if (code === '23505') return { ok: false, message: 'Cette adresse (identifiant d’URL) est déjà utilisée.' }
  if (code === '23503') return { ok: false, message: 'Élément utilisé ailleurs : dépubliez-le plutôt que de le supprimer.' }
  if (code === '23514') return { ok: false, message: 'Une valeur ne respecte pas le format attendu.' }
  throw error
}

export async function updateSettingsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('editContent')
  if (!user) return DENIED
  const { data, errors } = validateSettings(formObject(fd))
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors as Record<string, string> }
  try {
    await withActor(user.id, async (tx) => {
      await repo.updateSettings(tx, data, user.id)
      await audit(tx, user.id, 'content.settings', { type: 'site_settings' })
    })
  } catch (e) {
    return dbError(e)
  }
  updateTag(CONTENT_TAG)
  return SAVED
}

export async function updateClaimAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('editContent')
  if (!user) return DENIED
  const { data, errors } = validateClaim(formObject(fd))
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors }
  await withActor(user.id, async (tx) => {
    if (await repo.updateClaim(tx, data, user.id)) {
      await audit(tx, user.id, 'content.claim', { type: 'claim', id: data.key }, { confirmed: data.confirmed })
    }
  })
  updateTag(CONTENT_TAG)
  refresh()
  return { ok: true, message: data.confirmed ? 'Affirmation publiée sur le site.' : 'Affirmation masquée du site.' }
}

export async function saveServiceAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('editContent')
  if (!user) return DENIED
  const id = numId(fd)
  const { data, errors } = validateService(formObject(fd, ['relatedIds']))
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors as Record<string, string> }
  let newId: number | null = null
  try {
    await withActor(user.id, async (tx) => {
      if (id) {
        await repo.updateService(tx, id, data, user.id)
        await audit(tx, user.id, 'content.service_update', { type: 'service', id }, { slug: data.slug })
      } else {
        newId = await repo.insertService(tx, data, user.id)
        await audit(tx, user.id, 'content.service_create', { type: 'service', id: newId }, { slug: data.slug })
      }
    })
  } catch (e) {
    return dbError(e)
  }
  updateTag(CONTENT_TAG)
  if (newId) redirect(`/admin/contenu/prestations/${newId}?cree=1`)
  refresh()
  return SAVED
}

export async function deleteServiceAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('editContent')
  const id = numId(fd)
  if (!user || !id) return DENIED
  try {
    await withActor(user.id, async (tx) => {
      const slug = await repo.deleteService(tx, id)
      await audit(tx, user.id, 'content.service_delete', { type: 'service', id }, { slug })
    })
  } catch (e) {
    return dbError(e)
  }
  updateTag(CONTENT_TAG)
  redirect('/admin/contenu/prestations?supprimee=1')
}

export async function saveFaqAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('editContent')
  if (!user) return DENIED
  const id = numId(fd)
  const { data, errors } = validateFaq(formObject(fd))
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors }
  await withActor(user.id, async (tx) => {
    const faqId = id ?? (await repo.insertFaq(tx, data, user.id))
    if (id) await repo.updateFaq(tx, id, data, user.id)
    await audit(tx, user.id, id ? 'content.faq_update' : 'content.faq_create', { type: 'faq_item', id: faqId })
  })
  updateTag(CONTENT_TAG)
  refresh()
  return { ok: true, message: id ? 'Question mise à jour.' : 'Question ajoutée.' }
}

export async function deleteFaqAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('editContent')
  const id = numId(fd)
  if (!user || !id) return DENIED
  await withActor(user.id, async (tx) => {
    if (await repo.deleteFaq(tx, id)) await audit(tx, user.id, 'content.faq_delete', { type: 'faq_item', id })
  })
  updateTag(CONTENT_TAG)
  refresh()
  return { ok: true, message: 'Question supprimée.' }
}

export async function saveSectorAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('editContent')
  if (!user) return DENIED
  const id = numId(fd)
  const { data, errors } = validateSector(formObject(fd, ['serviceIds']))
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors }
  try {
    await withActor(user.id, async (tx) => {
      const sectorId = id ?? (await repo.insertSector(tx, data, user.id))
      if (id) await repo.updateSector(tx, id, data, user.id)
      await audit(tx, user.id, id ? 'content.sector_update' : 'content.sector_create', { type: 'sector', id: sectorId })
    })
  } catch (e) {
    return dbError(e)
  }
  updateTag(CONTENT_TAG)
  refresh()
  return { ok: true, message: id ? 'Secteur mis à jour.' : 'Secteur ajouté.' }
}

export async function deleteSectorAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await authorize('editContent')
  const id = numId(fd)
  if (!user || !id) return DENIED
  await withActor(user.id, async (tx) => {
    if (await repo.deleteSector(tx, id)) await audit(tx, user.id, 'content.sector_delete', { type: 'sector', id })
  })
  updateTag(CONTENT_TAG)
  refresh()
  return { ok: true, message: 'Secteur supprimé.' }
}
