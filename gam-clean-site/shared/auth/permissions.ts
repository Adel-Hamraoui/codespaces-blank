// ============================================================================
// Droits des rôles du back-office — source unique, utilisée par le backend
// (contrôle d'accès) et par l'interface (affichage des menus et boutons).
// ============================================================================
import type { AdminRole } from '../constants'

type WithRole = { role: AdminRole }

export const permissions = {
  manageLeads: (_u: WithRole) => true,
  deleteLeads: (u: WithRole) => u.role === 'owner' || u.role === 'editor',
  moderateReviews: (u: WithRole) => u.role === 'owner' || u.role === 'editor',
  editContent: (u: WithRole) => u.role === 'owner' || u.role === 'editor',
  manageUsers: (u: WithRole) => u.role === 'owner',
  viewAudit: (u: WithRole) => u.role === 'owner',
} satisfies Record<string, (u: WithRole) => boolean>

export type Permission = keyof typeof permissions

export const can = (u: WithRole, permission: Permission) => permissions[permission](u)
