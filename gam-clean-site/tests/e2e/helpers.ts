// Outils partagés par les tests de bout en bout.
import { readFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'
import postgres from 'postgres'

/** Accès direct à la base de test pour vérifier ce que l'interface a réellement enregistré. */
export function testDb() {
  const url = process.env.E2E_DATABASE_URL
  if (!url) throw new Error('E2E_DATABASE_URL manquante')
  return postgres(url, { max: 1, onnotice: () => {} })
}

export function ownerAccount(): { email: string; password: string } {
  return JSON.parse(readFileSync('tests/e2e/.auth/owner.json', 'utf8'))
}

/** Le formulaire public refuse les envois faits moins de 3 s après son affichage (anti-robots). */
export const waitAntiSpamDelay = (page: Page) => page.waitForTimeout(3_200)

/** Aucune violation d'accessibilité « grave » ou « critique » (règles WCAG 2.x A et AA). */
export async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(
    serious.map((v) => `${v.id} (${v.impact}) : ${v.nodes.length} élément(s) — ${v.nodes[0]?.target.join(' ')}`),
    `Violations d’accessibilité sur ${page.url()}`
  ).toEqual([])
}

/** Collecte les erreurs JavaScript de la page (à vérifier en fin de test). */
export function collectPageErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}
