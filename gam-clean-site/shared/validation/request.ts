// ============================================================================
// Demandes publiques (devis + contact) — validation partagée.
// Le navigateur l'utilise pour un retour immédiat ; le serveur l'applique
// toujours (seule source de vérité).
// ============================================================================
import { FREQUENCIES, OTHER_SERVICE, PROFILES, type Frequency, type Profile, type RequestType } from '../constants'
import { isEmail, isOneOf, line, normalizeEmail, parseIntIn, str, toE164, type FieldErrors } from './common'

export const REQUEST_LIMITS = {
  name: 100,
  company: 120,
  email: 254,
  phone: 30,
  location: 100,
  surface: 20,
  message: 3000,
  sourcePath: 200,
} as const

/** Saisie brute du formulaire, après nettoyage. */
export type RequestInput = {
  type: RequestType
  services: string[]
  frequency: Frequency | ''
  profile: Profile | ''
  location: string
  surface: string
  message: string
  name: string
  company: string
  phone: string
  email: string
  sourcePath: string
}

export type RequestField = keyof RequestInput

/** Données prêtes à enregistrer. */
export type ValidRequest = Omit<RequestInput, 'surface' | 'phone' | 'services'> & {
  serviceSlugs: string[]
  otherNeed: boolean
  surfaceM2: number | null
  phoneE164: string | null
}

export function sanitizeRequest(input: Record<string, unknown>, allowedServiceSlugs: readonly string[]): RequestInput {
  const raw = Array.isArray(input.services) ? input.services : typeof input.services === 'string' ? [input.services] : []
  const allowed = new Set([...allowedServiceSlugs, OTHER_SERVICE])
  return {
    type: input.type === 'contact' ? 'contact' : 'devis',
    services: [...new Set(raw.filter((s): s is string => typeof s === 'string' && allowed.has(s)))],
    frequency: isOneOf(FREQUENCIES, input.frequency) ? input.frequency : '',
    profile: isOneOf(PROFILES, input.profile) ? input.profile : '',
    location: line(input.location, REQUEST_LIMITS.location),
    surface: line(input.surface, REQUEST_LIMITS.surface),
    message: str(input.message, REQUEST_LIMITS.message),
    name: line(input.name, REQUEST_LIMITS.name),
    company: line(input.company, REQUEST_LIMITS.company),
    phone: line(input.phone, REQUEST_LIMITS.phone),
    email: normalizeEmail(input.email),
    sourcePath: line(input.sourcePath, REQUEST_LIMITS.sourcePath),
  }
}

export function validateRequest(d: RequestInput): { errors: FieldErrors<RequestField>; data: ValidRequest | null } {
  const e: FieldErrors<RequestField> = {}
  if (d.name.length < 2) e.name = 'Indiquez votre nom.'
  if (!d.email) e.email = 'Indiquez votre adresse e-mail.'
  else if (!isEmail(d.email)) e.email = 'Vérifiez l’adresse e-mail (exemple : nom@entreprise.fr).'

  const phoneE164 = d.phone ? toE164(d.phone) : null
  const surface = parseIntIn(d.surface, 1, 1_000_000)

  if (d.type === 'devis') {
    if (d.services.length === 0) e.services = 'Sélectionnez au moins une prestation (ou « Autre besoin »).'
    if (d.location.length < 2) e.location = 'Indiquez la ville ou le code postal des locaux.'
    if (!d.phone) e.phone = 'Indiquez un numéro pour organiser la visite.'
    else if (!phoneE164) e.phone = 'Vérifiez le numéro (exemple : 06 12 34 56 78).'
    if (surface === 'invalid') e.surface = 'Indiquez une surface en m² (exemple : 250).'
  } else {
    if (d.phone && !phoneE164) e.phone = 'Vérifiez le numéro (exemple : 06 12 34 56 78).'
    if (d.message.length < 10) e.message = 'Écrivez votre message (10 caractères minimum).'
  }

  if (Object.keys(e).length > 0) return { errors: e, data: null }
  return {
    errors: {},
    data: {
      type: d.type,
      frequency: d.type === 'devis' ? d.frequency : '',
      profile: d.type === 'devis' ? d.profile : '',
      location: d.location,
      message: d.message,
      name: d.name,
      company: d.company,
      email: d.email,
      sourcePath: d.sourcePath,
      serviceSlugs: d.services.filter((s) => s !== OTHER_SERVICE),
      otherNeed: d.services.includes(OTHER_SERVICE),
      surfaceM2: surface === 'invalid' ? null : surface,
      phoneE164,
    },
  }
}
