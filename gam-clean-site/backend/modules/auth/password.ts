// ============================================================================
// Hachage des mots de passe : scrypt (fonction native de Node.js, résistante
// aux attaques par matériel spécialisé). Paramètres OWASP : N=2^17, r=8, p=1.
// Format stocké : scrypt$<log2 N>$<r>$<p>$<sel base64>$<empreinte base64>
// ============================================================================
import 'server-only'
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'

const LOG2_N = 17
const R = 8
const P = 1
const KEY_LENGTH = 32
const MAXMEM = 256 * 1024 * 1024

function derive(password: string, salt: Buffer, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { ...opts, maxmem: MAXMEM }, (err, key) => (err ? reject(err) : resolve(key)))
  )
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt, { N: 2 ** LOG2_N, r: R, p: P })
  return `scrypt$${LOG2_N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, logN, r, p, saltB64, keyB64] = parts
  const expected = Buffer.from(keyB64, 'base64')
  const actual = await derive(password, Buffer.from(saltB64, 'base64'), { N: 2 ** Number(logN), r: Number(r), p: Number(p) })
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/** Les paramètres stockés sont-ils plus faibles que les paramètres actuels ? */
export function needsRehash(stored: string) {
  const [, logN, r, p] = stored.split('$')
  return Number(logN) < LOG2_N || Number(r) < R || Number(p) < P
}

let dummy: Promise<string> | null = null
/**
 * Vérification factice pour un identifiant inconnu : même durée de calcul,
 * pour ne pas révéler quels e-mails ont un compte.
 */
export async function burnTime(password: string) {
  dummy ??= hashPassword(randomBytes(16).toString('hex'))
  await verifyPassword(password, await dummy)
}

/** Mot de passe provisoire lisible (20 caractères, ~119 bits). */
export function temporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = randomBytes(20)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}
