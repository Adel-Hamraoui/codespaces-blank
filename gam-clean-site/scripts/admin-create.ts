// npm run admin:create -- --email prenom@exemple.fr --name "Prénom Nom" [--role owner|editor|sales]
// Crée un compte du back-office avec un mot de passe provisoire affiché une seule fois
// (changement obligatoire à la première connexion). Le premier compte est propriétaire.
import { parseArgs } from 'node:util'
import { databaseUrl } from './_env'
import { createSql } from '../backend/db/client'
import { hashPassword, temporaryPassword } from '../backend/modules/auth/password'
import { countUsers, insertUser } from '../backend/modules/users/repository'
import { ADMIN_ROLES } from '../shared/constants'
import { isOneOf } from '../shared/validation/common'
import { validateNewUser } from '../shared/validation/user'

const { values } = parseArgs({
  options: { email: { type: 'string' }, name: { type: 'string' }, role: { type: 'string' } },
})

const sql = createSql(databaseUrl(), 1)
try {
  const firstAccount = (await countUsers(sql)) === 0
  const role = values.role ?? (firstAccount ? 'owner' : 'sales')
  const { errors, data } = validateNewUser({ email: values.email ?? '', displayName: values.name ?? '', role })
  if (!isOneOf(ADMIN_ROLES, role)) errors.role = `rôle inconnu (${ADMIN_ROLES.map((r) => r.value).join(', ')})`
  if (Object.keys(errors).length > 0) {
    console.error('Données invalides :')
    for (const [field, message] of Object.entries(errors)) console.error(`  ${field} : ${message}`)
    process.exitCode = 1
  } else {
    const password = temporaryPassword()
    await insertUser(sql, { ...data, passwordHash: await hashPassword(password), mustChangePassword: true })
    console.log(`Compte créé : ${data.email} (${data.role})`)
    console.log(`Mot de passe provisoire (affiché une seule fois) : ${password}`)
    console.log('Il devra être changé à la première connexion sur /admin/connexion.')
  }
} catch (error) {
  const code = typeof error === 'object' && error && 'code' in error ? (error as { code: string }).code : null
  console.error(code === '23505' ? 'Un compte existe déjà avec cette adresse.' : `Échec : ${error instanceof Error ? error.message : error}`)
  process.exitCode = 1
} finally {
  await sql.end()
}
