'use server'
// ============================================================================
// Comptes d'administration (réservé aux propriétaires).
// ============================================================================
import { refresh } from 'next/cache'
import { getSql, pgCode, withActor } from '../db/client'
import { authorize } from '../modules/auth/guard'
import { hashPassword, temporaryPassword } from '../modules/auth/password'
import { destroyUserSessions } from '../modules/auth/session'
import { audit } from '../modules/audit/log'
import { countOtherActiveOwners, insertUser, setPassword, updateUser } from '../modules/users/repository'
import { ADMIN_ROLES } from '@/shared/constants'
import type { ActionState, PasswordState } from '@/shared/types/admin'
import { bool, isOneOf } from '@/shared/validation/common'
import { validateNewUser } from '@/shared/validation/user'

const DENIED: ActionState = { ok: false, message: 'Action réservée aux propriétaires du compte.' }

export async function createUserAction(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  const actor = await authorize('manageUsers')
  if (!actor) return DENIED
  const { data, errors } = validateNewUser(Object.fromEntries(fd))
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors }
  const password = temporaryPassword()
  try {
    await withActor(actor.id, async (tx) => {
      const id = await insertUser(tx, { ...data, passwordHash: await hashPassword(password), mustChangePassword: true })
      await audit(tx, actor.id, 'user.create', { type: 'admin_user', id }, { role: data.role })
    })
  } catch (e) {
    if (pgCode(e) === '23505') return { ok: false, fieldErrors: { email: 'Un compte existe déjà avec cette adresse.' } }
    throw e
  }
  refresh()
  return {
    ok: true,
    temporaryPassword: password,
    message: `Compte créé pour ${data.email}. Transmettez ce mot de passe provisoire par un canal sûr : il ne sera plus affiché et devra être changé à la première connexion.`,
  }
}

export async function updateUserAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const actor = await authorize('manageUsers')
  if (!actor) return DENIED
  const id = Number(fd.get('id'))
  const role = fd.get('role')
  const isActive = bool(fd.get('isActive'))
  if (!Number.isInteger(id) || !isOneOf(ADMIN_ROLES, role)) return { ok: false, message: 'Données invalides.' }
  const sql = getSql()
  if (!sql) return { ok: false, message: 'Base indisponible.' }
  if ((role !== 'owner' || !isActive) && (await countOtherActiveOwners(sql, id)) === 0) {
    return { ok: false, message: 'Il doit rester au moins un propriétaire actif.' }
  }
  await withActor(actor.id, async (tx) => {
    await updateUser(tx, id, { role, isActive })
    if (!isActive) await destroyUserSessions(tx, id)
    await audit(tx, actor.id, 'user.update', { type: 'admin_user', id }, { role, isActive })
  })
  refresh()
  return { ok: true, message: isActive ? 'Compte mis à jour.' : 'Compte désactivé et sessions fermées.' }
}

export async function resetPasswordAction(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  const actor = await authorize('manageUsers')
  if (!actor) return DENIED
  const id = Number(fd.get('id'))
  if (!Number.isInteger(id)) return { ok: false, message: 'Compte introuvable.' }
  const password = temporaryPassword()
  await withActor(actor.id, async (tx) => {
    await setPassword(tx, id, await hashPassword(password), true)
    await destroyUserSessions(tx, id)
    await audit(tx, actor.id, 'user.password_reset', { type: 'admin_user', id })
  })
  refresh()
  return { ok: true, temporaryPassword: password, message: 'Nouveau mot de passe provisoire (à changer à la prochaine connexion) :' }
}
