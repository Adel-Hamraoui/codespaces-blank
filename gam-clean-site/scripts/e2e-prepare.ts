// ============================================================================
// Prépare la base des tests de bout en bout (npm run test:e2e) :
// schéma vidé puis recréé, contenu initial, compte propriétaire de test.
// Garde-fou : la base doit s'appeler *_test ou *_e2e (elle est entièrement vidée).
// ============================================================================
import { mkdirSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { createSql } from '../backend/db/client'
import { migrate } from '../backend/db/migrate'
import { seed } from '../backend/db/seed'
import { hashPassword } from '../backend/modules/auth/password'
import { insertUser } from '../backend/modules/users/repository'

const url = process.env.E2E_DATABASE_URL
if (!url) {
  console.error('E2E_DATABASE_URL est absente (base PostgreSQL dédiée aux tests).')
  process.exit(1)
}
const dbName = new URL(url).pathname.slice(1)
if (!/_(test|e2e)$/.test(dbName)) {
  console.error(`Refusé : « ${dbName} » ne se termine pas par _test ou _e2e. Cette base serait vidée.`)
  process.exit(1)
}

const sql = createSql(url, 1)
try {
  await sql.unsafe('drop schema if exists gam cascade')
  await migrate(sql)
  await seed(sql)
  const account = { email: 'proprietaire.e2e@example.test', password: `Provisoire-${randomBytes(9).toString('base64url')}` }
  await insertUser(sql, {
    email: account.email,
    displayName: 'Propriétaire E2E',
    role: 'owner',
    passwordHash: await hashPassword(account.password),
    mustChangePassword: true,
  })
  mkdirSync('tests/e2e/.auth', { recursive: true })
  writeFileSync('tests/e2e/.auth/owner.json', JSON.stringify(account))
  console.log(`Base de test « ${dbName} » prête.`)
} finally {
  await sql.end()
}
