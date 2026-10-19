'use server'
// ============================================================================
// Connexion, déconnexion, changement de mot de passe.
// ============================================================================
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSql } from '../db/client'
import { burnTime, hashPassword, needsRehash, verifyPassword } from '../modules/auth/password'
import { createSession, destroySession, destroyUserSessions } from '../modules/auth/session'
import { requireAdmin } from '../modules/auth/guard'
import { audit } from '../modules/audit/log'
import { findForLogin, getPasswordHash, recordFailedLogin, recordSuccessfulLogin, setPassword } from '../modules/users/repository'
import { clientIp, isRateLimited } from '../security/rate-limit'
import type { ActionState } from '@/shared/types/admin'
import { safeInternalPath } from '@/shared/validation/common'
import { validateLogin, validatePasswordChange } from '@/shared/validation/user'

const GENERIC_ERROR = 'Identifiants incorrects, ou compte temporairement verrouillé après plusieurs essais.'

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { data, errors } = validateLogin(Object.fromEntries(formData))
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors }

  const sql = getSql()
  if (!sql) return { ok: false, message: 'La base de données n’est pas configurée (DATABASE_URL).' }

  const h = await headers()
  const ip = clientIp(h)
  if ((await isRateLimited('connexion-ip', ip, 20, 900)) || (await isRateLimited('connexion-compte', data.email, 10, 900))) {
    return { ok: false, message: 'Trop de tentatives. Réessayez dans quelques minutes.' }
  }

  const user = await findForLogin(sql, data.email)
  if (!user || !user.isActive) {
    await burnTime(data.password)
    return { ok: false, message: GENERIC_ERROR }
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await burnTime(data.password)
    return { ok: false, message: GENERIC_ERROR }
  }
  if (!(await verifyPassword(data.password, user.passwordHash))) {
    await recordFailedLogin(sql, user.id)
    await audit(sql, user.id, 'auth.login_failed', { type: 'admin_user', id: user.id })
    return { ok: false, message: GENERIC_ERROR }
  }

  await recordSuccessfulLogin(sql, user.id, needsRehash(user.passwordHash) ? await hashPassword(data.password) : undefined)
  await createSession(user.id, h.get('user-agent'))
  await audit(sql, user.id, 'auth.login', { type: 'admin_user', id: user.id })
  // Retour à la page demandée avant la connexion, uniquement à l'intérieur du back-office.
  const next = safeInternalPath(formData.get('suite'), '/admin')
  const target = /^\/admin(\/|\?|$)/.test(next) && !next.startsWith('/admin/connexion') ? next : '/admin'
  redirect(user.mustChangePassword ? '/admin/compte?premiere=1' : target)
}

export async function logoutAction() {
  await destroySession()
  redirect('/admin/connexion?deconnecte=1')
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, sessionId } = await requireAdmin(undefined, { allowPendingPassword: true })
  const sql = getSql()
  if (!sql) return { ok: false, message: 'Base de données indisponible.' }
  const { data, errors } = validatePasswordChange(Object.fromEntries(formData), user.email)
  if (Object.keys(errors).length) return { ok: false, fieldErrors: errors }
  if (await isRateLimited('mot-de-passe', String(user.id), 10, 900)) {
    return { ok: false, message: 'Trop de tentatives. Réessayez dans quelques minutes.' }
  }

  const current = await getPasswordHash(sql, user.id)
  if (!current || !(await verifyPassword(data.current, current))) {
    return { ok: false, fieldErrors: { currentPassword: 'Mot de passe actuel incorrect.' } }
  }
  await setPassword(sql, user.id, await hashPassword(data.next), false)
  await destroyUserSessions(sql, user.id, sessionId)
  await audit(sql, user.id, 'auth.password_change', { type: 'admin_user', id: user.id })
  if (user.mustChangePassword) redirect('/admin?bienvenue=1')
  return { ok: true, message: 'Mot de passe modifié. Vos autres sessions ont été fermées.' }
}
