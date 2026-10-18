// ============================================================================
// Avis clients (formulaire /avis/[jeton]) et invitations (back-office).
// ============================================================================
import { bool, isEmail, normalizeEmail, optStr, str, type FieldErrors } from './common'

export type ReviewInput = {
  rating: number
  ratingQuality: number | null
  ratingPunctuality: number | null
  ratingCommunication: number | null
  comment: string
  authorName: string
  authorCompany: string | null
  serviceSlug: string | null
  consentPublish: boolean
}

const rating = (v: unknown): number | null => {
  const n = Number(v)
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
}

export function validateReview(input: Record<string, unknown>) {
  const data: ReviewInput = {
    rating: rating(input.rating) ?? 0,
    ratingQuality: rating(input.ratingQuality),
    ratingPunctuality: rating(input.ratingPunctuality),
    ratingCommunication: rating(input.ratingCommunication),
    comment: str(input.comment, 2000),
    authorName: str(input.authorName, 80),
    authorCompany: optStr(input.authorCompany, 120),
    serviceSlug: optStr(input.serviceSlug, 80),
    consentPublish: bool(input.consentPublish),
  }
  const errors: FieldErrors<keyof ReviewInput> = {}
  if (!data.rating) errors.rating = 'Choisissez une note globale de 1 à 5.'
  if (data.comment.length < 10) errors.comment = 'Votre commentaire doit contenir au moins 10 caractères.'
  if (data.authorName.length < 2) errors.authorName = 'Indiquez votre nom ou vos initiales.'
  return { data, errors }
}

export type ReviewRequestInput = { clientName: string; clientEmail: string | null; leadId: string | null; sendEmail: boolean }

export function validateReviewRequest(input: Record<string, unknown>) {
  const email = normalizeEmail(input.clientEmail)
  const data: ReviewRequestInput = {
    clientName: str(input.clientName, 100),
    clientEmail: email || null,
    leadId: /^\d{1,18}$/.test(String(input.leadId ?? '')) ? String(input.leadId) : null,
    sendEmail: bool(input.sendEmail),
  }
  const errors: FieldErrors<keyof ReviewRequestInput> = {}
  if (data.clientName.length < 2) errors.clientName = 'Indiquez le nom du client.'
  if (data.clientEmail && !isEmail(data.clientEmail)) errors.clientEmail = 'Adresse e-mail invalide.'
  if (data.sendEmail && !data.clientEmail) errors.clientEmail = 'Indiquez l’e-mail du client pour lui envoyer le lien.'
  return { data, errors }
}
