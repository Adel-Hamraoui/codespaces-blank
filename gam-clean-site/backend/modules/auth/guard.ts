// ============================================================================
// Contrôle d'accès du back-office (couche d'accès aux données sécurisée).
// Chaque page et chaque action vérifie la session ET le rôle côté serveur :
// le proxy ne fait qu'une redirection rapide, il n'est pas une protection.
// ============================================================================
import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { readSession } from './session'
import { can, type Permission } from '@/shared/auth/permissions'
import type { AdminUser } from '@/shared/types/admin'

export type { Permission }

/** Session lue une seule fois par requête (mémoïsée). */
export const getCurrentSession = cache(readSession)

/**
 * Exige une session valide (sinon redirection vers la connexion) et,
 * si demandé, une permission (sinon redirection vers le tableau de bord).
 */
export async function requireAdmin(permission?: Permission, opts: { allowPendingPassword?: boolean } = {}): Promise<{ user: AdminUser; sessionId: string }> {
  const session = await getCurrentSession()
  if (!session) redirect('/admin/connexion')
  if (session.user.mustChangePassword && !opts.allowPendingPassword) redirect('/admin/compte?premiere=1')
  if (permission && !can(session.user, permission)) redirect('/admin?acces=refuse')
  return session
}

/** Pour les actions : renvoie l'utilisateur autorisé ou null (sans redirection). */
export async function authorize(permission: Permission): Promise<AdminUser | null> {
  const session = await getCurrentSession()
  if (!session || session.user.mustChangePassword) return null
  return can(session.user, permission) ? session.user : null
}
