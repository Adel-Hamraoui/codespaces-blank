// ============================================================================
// Application des migrations SQL (backend/db/migrations/NNNN_nom.sql).
// ----------------------------------------------------------------------------
// - Chaque fichier est appliqué dans sa propre transaction : en cas d'erreur,
//   rien n'est appliqué partiellement.
// - Verrou consultatif de transaction : deux exécutions simultanées (deux
//   déploiements) ne peuvent pas appliquer la même migration.
// - L'empreinte SHA-256 de chaque fichier appliqué est enregistrée : un fichier
//   modifié après coup est signalé au lieu d'être ignoré silencieusement.
// ============================================================================
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Sql } from './client'

export const MIGRATIONS_DIR = path.join(import.meta.dirname, 'migrations')
const FILE_RE = /^(\d{4})_[a-z0-9_]+\.sql$/
// Clé arbitraire mais stable du verrou consultatif.
const LOCK_KEY = 7_316_042_251

export type Migration = { version: number; name: string; sql: string; checksum: Buffer }

export async function readMigrations(dir = MIGRATIONS_DIR): Promise<Migration[]> {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()
  const migrations: Migration[] = []
  for (const file of files) {
    const match = FILE_RE.exec(file)
    if (!match) throw new Error(`Nom de migration invalide : ${file} (attendu : NNNN_nom.sql)`)
    const sql = await readFile(path.join(dir, file), 'utf8')
    migrations.push({
      version: Number(match[1]),
      name: file.replace(/\.sql$/, ''),
      sql,
      checksum: createHash('sha256').update(sql).digest(),
    })
  }
  const versions = migrations.map((m) => m.version)
  if (new Set(versions).size !== versions.length) throw new Error('Deux migrations portent le même numéro.')
  return migrations
}

async function ensureLedger(sql: Sql) {
  await sql.unsafe(`
    create schema if not exists gam;
    create table if not exists gam.schema_migrations (
      applied_at  timestamptz not null default now(),
      version     integer primary key,
      name        text not null,
      checksum    bytea not null check (octet_length(checksum) = 32)
    );
    comment on table gam.schema_migrations is 'Migrations appliquées (géré par backend/db/migrate.ts).';
  `).simple()
}

/** Applique les migrations en attente et renvoie leurs noms. */
export async function migrate(sql: Sql, { dir = MIGRATIONS_DIR, log = (_: string) => {} } = {}): Promise<string[]> {
  const migrations = await readMigrations(dir)
  await ensureLedger(sql)
  const applied: string[] = []

  for (const m of migrations) {
    const done = await sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(${LOCK_KEY})`
      const [row] = await tx<{ checksum: Buffer }[]>`select checksum from gam.schema_migrations where version = ${m.version}`
      if (row) {
        if (!row.checksum.equals(m.checksum)) {
          throw new Error(
            `La migration ${m.name} a été modifiée après son application. ` +
              'Ne modifiez jamais une migration appliquée : ajoutez-en une nouvelle.'
          )
        }
        return false
      }
      await tx.unsafe(m.sql).simple()
      await tx`insert into gam.schema_migrations (version, name, checksum) values (${m.version}, ${m.name}, ${m.checksum})`
      return true
    })
    if (done) {
      applied.push(m.name)
      log(`  ✓ ${m.name}`)
    }
  }
  return applied
}
