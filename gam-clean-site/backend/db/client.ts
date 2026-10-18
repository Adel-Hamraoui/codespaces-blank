// ============================================================================
// Accès PostgreSQL (Supabase) — un seul pool par instance serverless.
// ----------------------------------------------------------------------------
// - Compatible avec le pooler Supabase en mode « transaction » (port 6543) :
//   prepare: false (les requêtes préparées nommées n'y sont pas supportées).
// - SSL exigé hors réseau local (ou sslmode dans l'URL).
// - Toutes les requêtes passent par des gabarits paramétrés (pas d'injection SQL).
// ============================================================================
import 'server-only'
import postgres from 'postgres'
import { config } from '../config/env'

export type Sql = postgres.Sql
export type Tx = postgres.TransactionSql

declare global {
  var __gamSql: postgres.Sql | undefined
}

function isLocal(url: string) {
  try {
    const { hostname } = new URL(url)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return false
  }
}

export function createSql(url: string, max = config.dbPoolMax) {
  const explicitSsl = /[?&]sslmode=/.test(url)
  return postgres(url, {
    max,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    prepare: false,
    ssl: explicitSsl ? undefined : isLocal(url) ? false : 'require',
    onnotice: () => {},
    connection: { application_name: 'gam-clean-site' },
    transform: { undefined: null },
  })
}

/** Pool partagé, ou null si DATABASE_URL n'est pas configurée. */
export function getSql(): Sql | null {
  if (!config.databaseUrl) return null
  globalThis.__gamSql ??= createSql(config.databaseUrl)
  return globalThis.__gamSql
}

export function requireSql(): Sql {
  const sql = getSql()
  if (!sql) throw new DatabaseUnavailableError()
  return sql
}

export class DatabaseUnavailableError extends Error {
  constructor() {
    super('Base de données non configurée (DATABASE_URL absente).')
    this.name = 'DatabaseUnavailableError'
  }
}

/**
 * Transaction avec l'identité de l'administrateur à l'origine des changements :
 * les triggers (historique des statuts, modération) l'enregistrent.
 */
export async function withActor<T>(actorId: number | null, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const sql = requireSql()
  return sql.begin(async (tx) => {
    if (actorId !== null) await tx`select set_config('gam.actor_id', ${String(actorId)}, true)`
    return fn(tx)
  }) as Promise<T>
}

/** Code d'erreur PostgreSQL (23505 = unicité, 23503 = clé étrangère, 23514 = CHECK…). */
export function pgCode(error: unknown): string | null {
  return typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : null
}
