// ============================================================================
// Types échangés entre le backend et les écrans d'administration.
// ============================================================================
import type { AdminRole, Frequency, LeadStatus, LeadType, Profile, ReviewStatus } from '../constants'

export type AdminUser = {
  id: number
  email: string
  displayName: string
  role: AdminRole
  mustChangePassword: boolean
}

export type AdminUserRow = AdminUser & {
  isActive: boolean
  lastLoginAt: string | null
  lockedUntil: string | null
  createdAt: string
}

export type LeadListItem = {
  id: string
  createdAt: string
  type: LeadType
  status: LeadStatus
  name: string
  company: string | null
  email: string
  phone: string | null
  location: string | null
  serviceNames: string[]
  otherNeed: boolean
  assignedTo: string | null
  notified: boolean
}

export type LeadEvent = {
  id: string
  createdAt: string
  kind: 'status_change' | 'note' | 'assignment' | 'notification' | 'review_request'
  fromStatus: LeadStatus | null
  toStatus: LeadStatus | null
  actorName: string | null
  assigneeName: string | null
  body: string | null
}

export type LeadDetail = LeadListItem & {
  updatedAt: string
  statusChangedAt: string
  notifiedAt: string | null
  frequency: Frequency | null
  profile: Profile | null
  surfaceM2: number | null
  message: string | null
  sourcePath: string | null
  assignedToId: number | null
  events: LeadEvent[]
}

export type LeadFilters = {
  status?: LeadStatus
  type?: LeadType
  serviceId?: number
  assignedToId?: number
  q?: string
  from?: string // AAAA-MM-JJ
  to?: string // AAAA-MM-JJ
}

export type Page<T> = { items: T[]; nextCursor: string | null }

export type ReviewRow = {
  id: string
  createdAt: string
  status: ReviewStatus
  rating: number
  ratingQuality: number | null
  ratingPunctuality: number | null
  ratingCommunication: number | null
  consentPublish: boolean
  authorName: string
  authorCompany: string | null
  comment: string
  serviceName: string | null
  moderatedAt: string | null
  moderatorName: string | null
  rejectionReason: string | null
}

export type ReviewRequestRow = {
  id: string
  createdAt: string
  expiresAt: string
  usedAt: string | null
  clientName: string
  clientEmail: string | null
  leadId: string | null
  createdByName: string | null
}

export type AuditEntry = {
  id: string
  createdAt: string
  actorName: string | null
  action: string
  entityType: string | null
  entityId: string | null
  details: Record<string, unknown> | null
}

export type DashboardStats = {
  byStatus: Record<LeadStatus, number>
  last30Days: number
  previous30Days: number
  won90Days: number
  closed90Days: number
  pendingReviews: number
  publishedReviews: number
  unnotified: number
}

/** Résultat standard d'une action de formulaire (Server Action). */
export type ActionState = {
  ok: boolean
  message?: string
  fieldErrors?: Partial<Record<string, string>>
}

/** Création d'une invitation à laisser un avis : le lien n'est renvoyé qu'une fois. */
export type InvitationState = ActionState & { link?: string }

/** Création ou réinitialisation d'un compte : mot de passe provisoire affiché une seule fois. */
export type PasswordState = ActionState & { temporaryPassword?: string }
