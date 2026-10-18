#!/usr/bin/env node
// ============================================================================
// Vérifie la séparation des couches (npm run check:architecture) :
//   shared/   → aucune dépendance (ni React, ni Next.js, ni Node.js, ni autre couche)
//   frontend/ → peut utiliser shared/ ; jamais backend/ ni les modules serveur
//   backend/  → peut utiliser shared/ ; jamais frontend/
//   app/      → assemble les couches (routes, pages, API)
// Échec (code 1) à la première violation, avec la liste complète.
// ============================================================================
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const LAYERS = ['shared', 'frontend', 'backend', 'app']

const RULES = {
  shared: {
    layers: ['shared'],
    packages: [],
    reason: 'shared/ doit rester sans dépendance (code exécuté dans le navigateur et sur le serveur)',
  },
  frontend: {
    layers: ['shared', 'frontend'],
    packages: ['react', 'react-dom', 'next', 'lucide-react'],
    forbiddenPackages: ['next/headers', 'next/cache', 'server-only', 'postgres'],
    reason: 'frontend/ ne reçoit les données que par props : pas d’accès au backend ni aux modules serveur',
  },
  backend: {
    layers: ['shared', 'backend'],
    packages: ['react', 'next', 'server-only', 'postgres'],
    reason: 'backend/ ne dépend jamais de l’interface',
  },
}

const files = []
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (/\.(ts|tsx|mjs|js)$/.test(name)) files.push(full)
  }
}
for (const layer of LAYERS) walk(path.join(ROOT, layer))

const IMPORT_RE = /(?:^|\n)\s*(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g

function layerOf(abs) {
  const rel = path.relative(ROOT, abs).split(path.sep)
  return LAYERS.includes(rel[0]) ? rel[0] : null
}

const violations = []
for (const file of files) {
  const layer = layerOf(file)
  const rule = RULES[layer]
  if (!rule) continue
  const source = readFileSync(file, 'utf8')
  for (const m of source.matchAll(IMPORT_RE)) {
    const spec = m[1] ?? m[2] ?? m[3]
    let target = null
    if (spec.startsWith('@/')) target = layerOf(path.join(ROOT, spec.slice(2)))
    else if (spec.startsWith('.')) target = layerOf(path.resolve(path.dirname(file), spec))
    const where = `${path.relative(ROOT, file)} → ${spec}`
    if (target) {
      if (!rule.layers.includes(target)) violations.push(`${where}\n    ${rule.reason}`)
      continue
    }
    if (spec.startsWith('@/') || spec.startsWith('.')) continue // fichier hors couches (assets…)
    const pkg = spec.startsWith('node:') ? 'node:' : spec
    if (rule.forbiddenPackages?.some((p) => pkg === p || pkg.startsWith(`${p}/`))) {
      violations.push(`${where}\n    ${rule.reason}`)
    } else if (!rule.packages.some((p) => pkg === p || pkg.startsWith(`${p}/`)) && pkg !== 'node:' ) {
      violations.push(`${where}\n    dépendance non prévue pour ${layer}/ (à ajouter explicitement dans scripts/check-architecture.mjs)`)
    } else if (pkg === 'node:' && layer !== 'backend') {
      violations.push(`${where}\n    les modules Node.js sont réservés au backend`)
    }
  }
}

if (violations.length > 0) {
  console.error(`✗ ${violations.length} violation(s) de l’architecture :\n`)
  for (const v of violations) console.error(`  - ${v}`)
  process.exit(1)
}
console.log(`✓ Architecture respectée (${files.length} fichiers analysés : shared → frontend / backend → app).`)
