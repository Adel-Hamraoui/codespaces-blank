// ============================================================================
// Briques de validation communes (navigateur + serveur), sans dépendance.
// ============================================================================

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>
export type Validated<T, K extends string = string> = { ok: true; data: T } | { ok: false; errors: FieldErrors<K> }

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Chaîne nettoyée et tronquée ('' si la valeur n'est pas une chaîne). */
export const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Champ d'une seule ligne : caractères de contrôle (retours à la ligne, tabulations) remplacés par des espaces. */
export const line = (v: unknown, max: number) => str(typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ') : v, max)

/** Chaîne optionnelle : null si vide. */
export const optStr = (v: unknown, max: number) => str(v, max) || null

export const bool = (v: unknown) => v === true || v === 'true' || v === 'on' || v === '1'

/** Une ligne = un élément ; lignes vides ignorées. */
export const lines = (v: unknown, maxItems: number, maxLen: number) =>
  (typeof v === 'string' ? v.split(/\r?\n/) : Array.isArray(v) ? v : [])
    .map((l) => (typeof l === 'string' ? l.trim().slice(0, maxLen) : ''))
    .filter(Boolean)
    .slice(0, maxItems)

export const normalizeEmail = (v: unknown) => str(v, 254).toLowerCase()
export const isEmail = (v: string) => EMAIL_RE.test(v) && v.length <= 254

/**
 * Normalise un numéro au format international E.164.
 * « 06 12 34 56 78 », « 0612345678 », « +33 6 12 34 56 78 », « 0033612345678 » → « +33612345678 ».
 * Renvoie null si le numéro n'est pas valide.
 */
export function toE164(raw: string): string | null {
  let p = raw.replace(/[\s.\-()/]/g, '')
  if (p.startsWith('00')) p = `+${p.slice(2)}`
  if (/^0[1-9]\d{8}$/.test(p)) p = `+33${p.slice(1)}`
  if (p.startsWith('+33')) return /^\+33[1-9]\d{8}$/.test(p) ? p : null
  return /^\+[1-9]\d{7,14}$/.test(p) ? p : null
}

/** Affichage français d'un numéro E.164 (+33612345678 → 06 12 34 56 78). */
export function formatPhone(e164: string | null): string {
  if (!e164) return ''
  if (/^\+33\d{9}$/.test(e164)) return `0${e164.slice(3)}`.replace(/(\d{2})(?=\d)/g, '$1 ')
  return e164
}

/** Entier dans un intervalle, à partir d'une saisie libre (« 1 200 m² » → 1200). */
export function parseIntIn(v: unknown, min: number, max: number): number | null | 'invalid' {
  if (v === null || v === undefined || v === '') return null
  const s = String(v).replace(/\s|m²|m2/gi, '').replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(s)) return 'invalid'
  const n = Math.round(Number(s))
  return n >= min && n <= max ? n : 'invalid'
}

export const isOneOf = <T extends string>(list: readonly { value: T }[], v: unknown): v is T =>
  typeof v === 'string' && list.some((i) => i.value === v)

/** Chemin interne sûr (pas de redirection vers un autre site). */
export function safeInternalPath(v: unknown, fallback = '/'): string {
  const s = typeof v === 'string' ? v : ''
  return /^\/(?!\/)[\w\-/?=&%.#]*$/.test(s) ? s : fallback
}
