// Charge .env.local puis .env (sans écraser les variables déjà définies).
// Importé en premier par chaque script : la configuration est lue ensuite.
import { existsSync } from 'node:fs'

for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file)
}

export function databaseUrl(kind: 'app' | 'migrations' = 'app') {
  const url = (kind === 'migrations' && process.env.DATABASE_URL_MIGRATIONS) || process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL est absente (voir .env.example).')
    process.exit(1)
  }
  return url
}
