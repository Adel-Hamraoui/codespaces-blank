// ============================================================================
// Limitation de débit.
// - Avec base : compteur partagé entre toutes les instances serverless
//   (fonction SQL atomique gam.rate_limit_hit, table UNLOGGED).
// - Sans base : repli en mémoire, instance par instance.
// ============================================================================
import 'server-only'
import { getSql } from '../db/client'
import { keyedHash } from './tokens'

const memory = new Map<string, { start: number; hits: number }>()

function memoryHit(key: string, windowSec: number) {
  const now = Date.now()
  const entry = memory.get(key)
  if (!entry || now - entry.start >= windowSec * 1000) {
    memory.set(key, { start: now, hits: 1 })
    if (memory.size > 5000) for (const [k, v] of memory) if (now - v.start >= windowSec * 1000) memory.delete(k)
    return 1
  }
  entry.hits += 1
  return entry.hits
}

/**
 * Enregistre un appel et indique s'il dépasse la limite.
 * @param scope   famille d'actions (« demande », « connexion »…)
 * @param subject identifiant de l'appelant (adresse IP, e-mail…), jamais stocké en clair
 */
export async function isRateLimited(scope: string, subject: string, limit: number, windowSec: number): Promise<boolean> {
  const key = keyedHash(scope, subject)
  const sql = getSql()
  if (sql) {
    try {
      const [row] = await sql<{ hits: number }[]>`
        select gam.rate_limit_hit(${key}, make_interval(secs => ${windowSec})) as hits`
      return row.hits > limit
    } catch (error) {
      console.error('[anti-abus] Compteur en base indisponible, repli en mémoire.', error)
    }
  }
  return memoryHit(key.toString('base64'), windowSec) > limit
}

/** Adresse IP du client derrière le proxy de Vercel. */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'inconnue'
}
