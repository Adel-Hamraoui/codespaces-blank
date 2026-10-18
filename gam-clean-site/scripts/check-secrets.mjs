#!/usr/bin/env node
// ============================================================================
// Vérifie qu'aucun secret n'apparaît dans ce que reçoit le navigateur
// (npm run check:secrets, après npm run build, avec les MÊMES variables
// d'environnement que la compilation).
//   1. Valeurs exactes des variables secrètes (DATABASE_URL, APP_SECRET…).
//   2. Motifs reconnaissables, même sans variable définie : clé API Resend,
//      chaîne de connexion PostgreSQL contenant un mot de passe.
// Fichiers analysés : .next/static (JavaScript, CSS) et, dans .next/server/app,
// les pages pré-générées envoyées telles quelles (HTML, données RSC).
// Échec (code 1) à la première fuite, avec la liste complète.
// ============================================================================
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SECRET_VARS = ['DATABASE_URL', 'DATABASE_URL_MIGRATIONS', 'APP_SECRET', 'CRON_SECRET', 'RESEND_API_KEY']
const PATTERNS = [
  { name: 'clé API Resend', re: /\bre_[A-Za-z0-9_]{20,}\b/ },
  { name: 'chaîne de connexion PostgreSQL avec mot de passe', re: /postgres(?:ql)?:\/\/[^\s"'`:@/]+:[^\s"'`@/]+@/ },
]

const STATIC_DIR = path.join(ROOT, '.next/static')
const PAGES_DIR = path.join(ROOT, '.next/server/app')
if (!existsSync(STATIC_DIR)) {
  console.error('✗ Aucune compilation trouvée : lancez d’abord npm run build.')
  process.exit(1)
}

const files = []
function walk(dir, keep) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full, keep)
    else if (keep(full)) files.push(full)
  }
}
walk(STATIC_DIR, () => true)
walk(PAGES_DIR, (f) => /\.(html|rsc|body)$/.test(f))

const secrets = SECRET_VARS.map((name) => ({ name, value: process.env[name] })).filter((s) => s.value && s.value.length >= 8)

const leaks = []
for (const file of files) {
  const content = readFileSync(file, 'utf8')
  const where = path.relative(ROOT, file)
  for (const s of secrets) if (content.includes(s.value)) leaks.push(`${where} : valeur de ${s.name}`)
  for (const p of PATTERNS) if (p.re.test(content)) leaks.push(`${where} : ${p.name}`)
}

if (leaks.length > 0) {
  console.error(`✗ ${leaks.length} secret(s) exposé(s) au navigateur :\n`)
  for (const l of leaks) console.error(`  - ${l}`)
  process.exit(1)
}
const checked = secrets.length > 0 ? secrets.map((s) => s.name).join(', ') : 'aucune variable secrète définie (motifs seuls)'
console.log(`✓ Aucun secret dans ${files.length} fichiers envoyés au navigateur (valeurs vérifiées : ${checked}).`)
