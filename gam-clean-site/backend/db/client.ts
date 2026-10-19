// ============================================================================
// Accès PostgreSQL (Supabase) — un seul pool par instance serverless.
// ----------------------------------------------------------------------------
// - Compatible avec le pooler Supabase en mode « transaction » (port 6543) :
//   requêtes préparées désactivées par défaut (non prises en charge par ce pooler).
// - SSL exigé hors réseau local (ou sslmode dans l'URL).
// - Toutes les requêtes passent par des gabarits paramétrés (pas d'injection SQL).
// ============================================================================
import 'server-only'
import postgres from 'postgres'
import { config } from '../config/env'

export type Sql = postgres.Sql
export type Tx = postgres.TransactionSql

function isLocal(url: string) {
  try {
    const { hostname } = new URL(url)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return false
  }
}

/** Port 6543 : « Transaction pooler » de Supabase. */
function isTransactionPooler(url: string) {
  try {
    return new URL(url).port === '6543'
  } catch {
    return false
  }
}

/**
 * Requêtes préparées : un aller-retour réseau par requête au lieu de deux (sans
 * elles, postgres.js fait décrire chaque requête paramétrée avant de l'exécuter).
 * Option DB_PREPARED_STATEMENTS=true, réservée à une connexion directe ou au
 * « Session pooler » ; toujours désactivées avec le « Transaction pooler » (port 6543).
 */
function usePreparedStatements(url: string) {
  if (!config.dbPreparedStatements) return false
  if (isTransactionPooler(url)) {
    console.warn('[base] DB_PREPARED_STATEMENTS ignorée : le Transaction pooler (port 6543) ne prend pas en charge les requêtes préparées.')
    return false
  }
  return true
}

/** Délai maximal d'une requête du site, file d'attente du pool et connexion comprises. */
export const QUERY_TIMEOUT_MS = 12_000
/** Délai maximal d'une transaction complète (sql.begin). */
const TRANSACTION_TIMEOUT_MS = 20_000

/**
 * Pool postgres.js. `serverTimeouts` ajoute des délais appliqués par PostgreSQL
 * lui-même (requête, transaction ouverte inactive) : ils sont transmis à
 * l'ouverture de la connexion, ce que le Transaction pooler ne garantit pas
 * (connexions serveur partagées) ; ils ne sont donc envoyés qu'aux connexions
 * directes ou au Session pooler. Le délai côté application (getSql) couvre tous les cas.
 */
export function createSql(url: string, max = config.dbPoolMax, { serverTimeouts = false } = {}) {
  const explicitSsl = /[?&]sslmode=/.test(url)
  const withServerTimeouts = serverTimeouts && !isTransactionPooler(url)
  return postgres(url, {
    max,
    // Connexions inactives fermées après 20 s en production (instances serverless).
    // Hors production, la base est souvent distante (Supabase depuis un poste) : chaque
    // reconnexion coûte la négociation TLS et l'authentification (≈ 1,4 s mesurée avec
    // 200 ms d'aller-retour), d'où des connexions gardées 10 minutes.
    idle_timeout: config.isProduction ? 20 : 600,
    connect_timeout: 10,
    // Connexions renouvelées toutes les 30 min au plus ; sondes TCP toutes les 30 s
    // pour détecter une connexion coupée et garder les équipements réseau éveillés.
    max_lifetime: 60 * 30,
    keep_alive: 30,
    prepare: usePreparedStatements(url),
    ssl: explicitSsl ? undefined : isLocal(url) ? false : 'require',
    onnotice: () => {},
    connection: {
      application_name: 'gam-clean-site',
      ...(withServerTimeouts && {
        statement_timeout: QUERY_TIMEOUT_MS - 2_000,
        idle_in_transaction_session_timeout: TRANSACTION_TIMEOUT_MS,
      }),
    },
    transform: { undefined: null },
  })
}

export class DatabaseTimeoutError extends Error {
  constructor(what: string, ms: number) {
    super(`La base de données n'a pas répondu dans le délai (${ms / 1000} s) : ${what}`)
    this.name = 'DatabaseTimeoutError'
  }
}

// ---------------------------------------------------------------------------
// Pool partagé, protégé contre les requêtes qui ne reviennent jamais.
// Constaté : une connexion coupée silencieusement (réseau, pooler) ne renvoie
// plus rien, sans être fermée. postgres.js continue d'y envoyer les requêtes
// suivantes, qui attendent indéfiniment : tout le back-office se bloque. Ici,
// une requête qui dépasse QUERY_TIMEOUT_MS échoue avec une erreur explicite et
// le pool est remplacé ; l'ancien termine ses requêtes saines puis est fermé.
//
// Avec le Transaction pooler, une requête par connexion à la fois. Par défaut,
// postgres.js envoie une requête sans paramètre sur une connexion déjà occupée,
// sans attendre la réponse précédente (pipeline). Constaté avec ce pooler : des
// requêtes sans paramètre lancées en parallèle par une même page restaient sans
// réponse jusqu'au délai. L'option max_pipeline ne convient pas (à 0, sql.begin
// échoue) : une file d'attente limite donc les requêtes et transactions en cours
// au nombre de connexions du pool, et postgres.js trouve toujours une connexion libre.
// ---------------------------------------------------------------------------

/** Place réservée dans la file : `done()` la libère, `done(true)` la laisse occupée (connexion bloquée). */
type Done = (hung?: boolean) => void

export type Gate = {
  /** Lance `start` dès qu'une place est libre. */
  enter(start: () => void): Done
  /** Appelle `onIdle` quand plus rien n'attend ni ne s'exécute (hors connexions bloquées). */
  whenIdle(onIdle: () => void): void
}

export function createGate(size: number): Gate {
  const waiting: Array<() => void> = []
  let running = 0
  let hung = 0
  let idle: (() => void) | null = null
  const pump = () => {
    while (running < size && waiting.length) waiting.shift()!()
    if (idle && !waiting.length && running === hung) {
      idle()
      idle = null
    }
  }
  return {
    enter(start) {
      let state: 'waiting' | 'running' | 'done' = 'waiting'
      const go = () => {
        state = 'running'
        running++
        start()
      }
      waiting.push(go)
      pump()
      return (isHung = false) => {
        if (state === 'waiting') waiting.splice(waiting.indexOf(go), 1)
        else if (state === 'running') isHung ? hung++ : running--
        state = 'done'
        pump()
      }
    },
    whenIdle(onIdle) {
      idle = onIdle
      pump()
    },
  }
}

type Pool = { sql: Sql; gate: Gate | null }
type PoolState = { pool: Pool }

declare global {
  var __gamDb: PoolState | undefined
  var __gamDbSql: Sql | undefined
}

function createPool(url: string): Pool {
  const max = config.dbPoolMax
  return { sql: createSql(url, max, { serverTimeouts: true }), gate: isTransactionPooler(url) ? createGate(max) : null }
}

const shortSql = (strings: readonly string[]) => strings.join('?').replace(/\s+/g, ' ').trim().slice(0, 90)

function replacePool(state: PoolState, old: Pool, url: string, reason: string) {
  if (state.pool !== old) return // déjà remplacé
  state.pool = createPool(url)
  // Avertissement : l'erreur elle-même est levée à l'appelant (page d'erreur du back-office).
  console.warn(`[base] ${reason} — pool de connexions remplacé.`)
  const end = () => void old.sql.end({ timeout: 5 }).catch(() => {})
  if (old.gate) old.gate.whenIdle(end)
  else end()
}

/**
 * Lance `run` à son tour dans la file du pool (s'il en a une), limité dans le temps ;
 * au dépassement, le pool est remplacé.
 */
function guarded<T>(state: PoolState, pool: Pool, run: (resolve: (v: T) => void, reject: (e: unknown) => void) => void, ms: number, what: string, url: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let done: Done = () => {}
    const settle = <V>(fn: (v: V) => void) => (v: V) => {
      clearTimeout(timer)
      done()
      fn(v)
    }
    const timer = setTimeout(() => {
      done(true)
      const error = new DatabaseTimeoutError(what, ms)
      replacePool(state, pool, url, error.message)
      reject(error)
    }, ms)
    const start = () => run(settle(resolve), settle(reject))
    if (pool.gate) done = pool.gate.enter(start)
    else start()
  })
}

function guardedSql(url: string): Sql {
  const state = globalThis.__gamDb!
  const handler: ProxyHandler<Sql> = {
    apply(_target, _this, args: unknown[]) {
      const pool = state.pool
      const query = Reflect.apply(pool.sql, undefined, args)
      // Seuls les gabarits sql`…` réellement attendus sont limités dans le temps ;
      // un fragment inclus dans une autre requête n'est jamais attendu seul.
      if (!(Array.isArray(args[0]) && 'raw' in args[0]) || typeof query?.then !== 'function') return query
      const original = query.then
      let result: Promise<unknown> | null = null
      query.then = function (onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) {
        result ??= guarded(state, pool, (res, rej) => original.call(query, res, rej), QUERY_TIMEOUT_MS, shortSql(args[0] as string[]), url)
        return result.then(onFulfilled, onRejected)
      }
      return query
    },
    get(_target, prop) {
      const pool = state.pool
      const value = Reflect.get(pool.sql, prop)
      if (prop === 'begin' && typeof value === 'function') {
        return (...args: unknown[]) =>
          guarded(state, pool, (res, rej) => (value as (...a: unknown[]) => Promise<unknown>).apply(pool.sql, args).then(res, rej), TRANSACTION_TIMEOUT_MS, 'transaction', url)
      }
      return value
    },
  }
  return new Proxy((() => {}) as unknown as Sql, handler)
}

/**
 * Pool partagé du site, ou null si DATABASE_URL n'est pas configurée. Conservé
 * dans globalThis : un seul pool même après les rechargements à chaud du développement.
 */
export function getSql(): Sql | null {
  const url = config.databaseUrl
  if (!url) return null
  globalThis.__gamDb ??= { pool: createPool(url) }
  globalThis.__gamDbSql ??= guardedSql(url)
  return globalThis.__gamDbSql
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
