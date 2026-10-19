// ============================================================================
// Comptes d'administration — accès aux données.
// ============================================================================
import 'server-only'
import type { Sql, Tx } from '../../db/client'
import type { AdminRole } from '@/shared/constants'
import type { AdminUser, AdminUserRow } from '@/shared/types/admin'

export type LoginRecord = AdminUser & { passwordHash: string; isActive: boolean; lockedUntil: Date | null; failedLogins: number }

export async function findForLogin(sql: Sql, email: string): Promise<LoginRecord | null> {
  const [r] = await sql<LoginRecord[]>`
    select id, email, display_name as "displayName", role, must_change_password as "mustChangePassword",
           password_hash as "passwordHash", is_active as "isActive", locked_until as "lockedUntil",
           failed_logins as "failedLogins"
    from gam.admin_users where email = ${email}`
  return r ?? null
}

/** Échec de connexion : 5 échecs consécutifs = verrouillage de 15 minutes (doublé ensuite, plafonné à 24 h). */
export async function recordFailedLogin(sql: Sql, id: number) {
  await sql`
    update gam.admin_users set
      failed_logins = failed_logins + 1,
      locked_until = case
        when failed_logins + 1 >= 5
        then now() + least(interval '24 hours', interval '15 minutes' * power(2, failed_logins + 1 - 5))
        else locked_until end
    where id = ${id}`
}

export async function recordSuccessfulLogin(sql: Sql, id: number, newHash?: string) {
  await sql`
    update gam.admin_users set failed_logins = 0, locked_until = null, last_login_at = now()
      ${newHash ? sql`, password_hash = ${newHash}` : sql``}
    where id = ${id}`
}

export async function listUsers(sql: Sql): Promise<AdminUserRow[]> {
  const rows = await sql<(Omit<AdminUserRow, 'lastLoginAt' | 'lockedUntil' | 'createdAt'> & { lastLoginAt: Date | null; lockedUntil: Date | null; createdAt: Date })[]>`
    select id, email, display_name as "displayName", role, must_change_password as "mustChangePassword",
           is_active as "isActive", last_login_at as "lastLoginAt", locked_until as "lockedUntil", created_at as "createdAt"
    from gam.admin_users order by is_active desc, display_name`
  return rows.map((r) => ({
    ...r,
    lastLoginAt: r.lastLoginAt?.toISOString() ?? null,
    lockedUntil: r.lockedUntil?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function listAssignableUsers(sql: Sql) {
  return sql<{ id: number; displayName: string }[]>`
    select id, display_name as "displayName" from gam.admin_users where is_active order by display_name`
}

export async function insertUser(tx: Tx | Sql, d: { email: string; displayName: string; role: AdminRole; passwordHash: string; mustChangePassword: boolean }) {
  const [r] = await tx<{ id: number }[]>`
    insert into gam.admin_users (email, display_name, role, password_hash, must_change_password)
    values (${d.email}, ${d.displayName}, ${d.role}, ${d.passwordHash}, ${d.mustChangePassword})
    returning id`
  return r.id
}

export async function getPasswordHash(sql: Sql, id: number) {
  const [r] = await sql<{ passwordHash: string }[]>`select password_hash as "passwordHash" from gam.admin_users where id = ${id}`
  return r?.passwordHash ?? null
}

export async function setPassword(tx: Tx | Sql, id: number, hash: string, mustChange: boolean) {
  await tx`
    update gam.admin_users set password_hash = ${hash}, must_change_password = ${mustChange},
      password_changed_at = now(), failed_logins = 0, locked_until = null
    where id = ${id}`
}

export async function updateUser(tx: Tx, id: number, d: { role?: AdminRole; isActive?: boolean; displayName?: string }) {
  const rows = await tx`
    update gam.admin_users set
      role = coalesce(${d.role ?? null}::gam.admin_role, role),
      is_active = coalesce(${d.isActive ?? null}::boolean, is_active),
      display_name = coalesce(${d.displayName ?? null}, display_name)
    where id = ${id} returning id`
  return rows.length > 0
}

/** Nombre de propriétaires actifs, hors compte donné (on ne retire jamais le dernier). */
export async function countOtherActiveOwners(sql: Sql | Tx, excludeId: number) {
  const [r] = await sql<{ n: number }[]>`
    select count(*)::int as n from gam.admin_users where role = 'owner' and is_active and id <> ${excludeId}`
  return r.n
}

export async function countUsers(sql: Sql) {
  const [r] = await sql<{ n: number }[]>`select count(*)::int as n from gam.admin_users`
  return r.n
}
