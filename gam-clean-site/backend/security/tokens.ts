// ============================================================================
// Jetons aléatoires et empreintes.
// Un jeton (session, invitation) n'est jamais stocké : seule son empreinte
// SHA-256 l'est. Une fuite de la base ne permet donc pas d'usurper un lien.
// ============================================================================
import 'server-only'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { config } from '../config/env'

/** Jeton de 256 bits encodé en base64url (43 caractères). */
export const newToken = () => randomBytes(32).toString('base64url')

export const sha256 = (value: string) => createHash('sha256').update(value).digest()

export const isTokenFormat = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{43}$/.test(v)

/**
 * Empreinte HMAC d'une donnée personnelle (adresse IP) pour l'anti-abus :
 * l'adresse n'est jamais stockée en clair.
 */
let warned = false

export function keyedHash(scope: string, value: string): Buffer {
  if (!config.appSecret && config.isProduction && !warned) {
    warned = true
    console.warn('[sécurité] APP_SECRET absente : définissez-la pour protéger les empreintes anti-abus.')
  }
  const secret = config.appSecret ?? 'gam-clean-developpement'
  return createHmac('sha256', secret).update(`${scope}:${value}`).digest()
}

export function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b)
}
