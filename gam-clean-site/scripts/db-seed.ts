// npm run db:seed — crée le contenu initial manquant (n'écrase rien).
import { databaseUrl } from './_env'
import { createSql } from '../backend/db/client'
import { seed } from '../backend/db/seed'

const sql = createSql(databaseUrl('migrations'), 1)
try {
  const r = await seed(sql)
  console.log('Contenu initial créé :')
  console.log(`  coordonnées ${r.settings} · affirmations ${r.claims} · prestations ${r.services}`)
  console.log(`  liens entre prestations ${r.relations} · questions FAQ ${r.faq} · secteurs ${r.sectors}`)
} catch (error) {
  console.error('Échec :', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await sql.end()
}
