// ============================================================================
// Sessions du back-office, stockées en base (révocables immédiatement).
// - Cookie : jeton aléatoire de 256 bits, HttpOnly, Secure, SameSite=Lax,
//   préfixe __Host- en production (lié au domaine exact, pas de sous-domaine).
// - Base : seule l'empreinte SHA-256 du jeton est conservée.
// - Durée : 12 h maximum, expiration après 2 h d'inactivité.
// ============================================================================
import 'server-only'
import { cookies } from 'next/headers'
import { config } from '../../config/env'
import { getSql, requireSql, type Sql, type Tx } from '../../db/client'
import { isTokenFormat, newToken, sha256 } from '../../security/tokens'
import type { AdminUser } from '@/shared/types/admin'

export const SESSION_COOKIE = config.isProduction ? '__Host-gam_admin' : 'gam_admin'
const ABSOLUTE_HOURS = 12
const IDLE_MINUTES = 120
const TOUCH_AFTER_MINUTES = 5

export async function createSession(userId: number, userAgent: string | null) {
  const token = newToken()
  const sql = requireSql()
  await sql`
    insert into gam.admin_sessions (user_id, token_hash, expires_at, user_agent)
    values (${userId}, ${sha256(token)}, now() + make_interval(hours => ${ABSOLUTE_HOURS}), ${userAgent?.slice(0, 300) ?? null})`
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ABSOLUTE_HOURS * 3600,
  })
}

type SessionRow = AdminUser & { sessionId: string; idle: boolean; touch: boolean }

/** Session courante (ou null). Prolonge l'activité au plus toutes les 5 minutes (écritures limitées). */
export async function readSession(): Promise<{ user: AdminUser; sessionId: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const sql = getSql()
  if (!sql || !isTokenFormat(token)) return null
  const [row] = await sql<SessionRow[]>`
    select s.id::text as "sessionId", u.id, u.email, u.display_name as "displayName", u.role,
           u.must_change_password as "mustChangePassword",
           s.last_seen_at < now() - make_interval(mins => ${IDLE_MINUTES}) as idle,
           s.last_seen_at < now() - make_interval(mins => ${TOUCH_AFTER_MINUTES}) as touch
    from gam.admin_sessions s
    join gam.admin_users u on u.id = s.user_id and u.is_active
    where s.token_hash = ${sha256(token)} and s.expires_at > now()`
  if (!row) return null
  if (row.idle) {
    await sql`delete from gam.admin_sessions where id = ${row.sessionId}::bigint`
    return null
  }
  if (row.touch) await sql`update gam.admin_sessions set last_seen_at = now() where id = ${row.sessionId}::bigint`
  const { sessionId, idle: _i, touch: _t, ...user } = row
  return { user, sessionId }
}

export async function destroySession() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  const sql = getSql()
  if (sql && isTokenFormat(token)) await sql`delete from gam.admin_sessions where token_hash = ${sha256(token)}`
  jar.delete(SESSION_COOKIE)
}

/** Ferme toutes les sessions d'un compte (sauf éventuellement la session courante). */
export async function destroyUserSessions(sql: Sql | Tx, userId: number, exceptSessionId?: string) {
  await sql`
    delete from gam.admin_sessions
    where user_id = ${userId} ${exceptSessionId ? sql`and id <> ${exceptSessionId}::bigint` : sql``}`
}
