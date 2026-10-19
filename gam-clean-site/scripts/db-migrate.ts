// npm run db:migrate — applique les migrations en attente.
import { databaseUrl } from './_env'
import { createSql } from '../backend/db/client'
import { migrate } from '../backend/db/migrate'

const sql = createSql(databaseUrl('migrations'), 1)
try {
  console.log('Migrations :')
  const applied = await migrate(sql, { log: console.log })
  console.log(applied.length > 0 ? `${applied.length} migration(s) appliquée(s).` : '  base déjà à jour.')
} catch (error) {
  console.error('Échec :', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
