// ============================================================================
// Validation des demandes (devis + contact)
// Partagée entre le navigateur (retour immédiat) et le serveur (seule source
// de vérité). Aucune dépendance externe.
// ============================================================================
import { serviceIndex as services } from '@/content/service-index'

export type RequestType = 'devis' | 'contact'

export const OTHER_SERVICE = 'autre'

export const serviceChoices = [
  ...services.map((s) => ({ value: s.slug, label: s.name })),
  { value: OTHER_SERVICE, label: 'Autre besoin' },
]

export const profileChoices = [
  'Entreprise',
  'Commerce ou ERP',
  'Site industriel ou logistique',
  'Syndic ou copropriété',
  'Collectivité',
  'Établissement de santé',
  'Promoteur ou entreprise du BTP',
  'Particulier',
  'Autre',
] as const

export const frequencyChoices = [
  'Intervention ponctuelle',
  'Entretien régulier',
  'À définir ensemble',
] as const

export const LIMITS = {
  name: 100,
  company: 120,
  email: 254,
  phone: 30,
  location: 100,
  surface: 40,
  message: 3000,
} as const

export type RequestData = {
  type: RequestType
  services: string[]
  frequency: string
  profile: string
  location: string
  surface: string
  message: string
  name: string
  company: string
  phone: string
  email: string
}

export type FieldErrors = Partial<Record<keyof RequestData, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normalizePhone(raw: string) {
  return raw.replace(/[\s.\-()]/g, '')
}

export function isValidPhone(raw: string) {
  const p = normalizePhone(raw)
  return /^(?:(?:\+|00)33|0)[1-9]\d{8}$/.test(p) || /^\+\d{8,15}$/.test(p)
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Convertit une entrée inconnue (JSON ou formulaire) en données propres. */
export function sanitize(input: Record<string, unknown>): RequestData {
  const rawServices = Array.isArray(input.services)
    ? input.services
    : typeof input.services === 'string'
      ? [input.services]
      : []
  const allowed = new Set(serviceChoices.map((c) => c.value))
  return {
    type: input.type === 'contact' ? 'contact' : 'devis',
    services: [...new Set(rawServices.filter((s): s is string => typeof s === 'string' && allowed.has(s)))],
    frequency: frequencyChoices.includes(input.frequency as never) ? (input.frequency as string) : '',
    profile: profileChoices.includes(input.profile as never) ? (input.profile as string) : '',
    location: str(input.location, LIMITS.location),
    surface: str(input.surface, LIMITS.surface),
    message: str(input.message, LIMITS.message),
    name: str(input.name, LIMITS.name),
    company: str(input.company, LIMITS.company),
    phone: str(input.phone, LIMITS.phone),
    email: str(input.email, LIMITS.email),
  }
}

export function validate(d: RequestData): FieldErrors {
  const e: FieldErrors = {}
  if (d.name.length < 2) e.name = 'Indiquez votre nom.'
  if (!d.email) e.email = 'Indiquez votre adresse e-mail.'
  else if (!EMAIL_RE.test(d.email)) e.email = 'Vérifiez l’adresse e-mail (exemple : nom@entreprise.fr).'

  if (d.type === 'devis') {
    if (d.services.length === 0) e.services = 'Sélectionnez au moins une prestation (ou « Autre besoin »).'
    if (d.location.length < 2) e.location = 'Indiquez la ville ou le code postal des locaux.'
    if (!d.phone) e.phone = 'Indiquez un numéro pour organiser la visite.'
    else if (!isValidPhone(d.phone)) e.phone = 'Vérifiez le numéro (exemple : 06 12 34 56 78).'
  } else {
    if (d.phone && !isValidPhone(d.phone)) e.phone = 'Vérifiez le numéro (exemple : 06 12 34 56 78).'
    if (d.message.length < 10) e.message = 'Écrivez votre message (10 caractères minimum).'
  }
  return e
}

export const serviceLabel = (slug: string) => serviceChoices.find((c) => c.value === slug)?.label ?? slug
