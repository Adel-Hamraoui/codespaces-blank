// ============================================================================
// Mobile : menu, barre d'actions fixe, absence de défilement horizontal.
// ============================================================================
import { expect, test } from '@playwright/test'

const PAGES = ['/', '/prestations', '/prestations/prestations-specialisees', '/secteurs', '/devis', '/contact', '/faq']

test('aucun défilement horizontal sur les pages principales', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})

test('menu mobile : ouverture, Échap, retour du focus', async ({ page }) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Ouvrir le menu' })
  await toggle.click()
  const panel = page.getByRole('navigation', { name: 'Navigation mobile' })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('link', { name: 'Nettoyage de bureaux' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toBeFocused()
})

test('barre d’actions : appeler et demander un devis', async ({ page }) => {
  await page.goto('/prestations')
  const bar = page.getByRole('complementary', { name: 'Contact rapide' })
  await expect(bar.getByRole('link', { name: 'Appeler' })).toHaveAttribute('href', /^tel:\+33/)
  await bar.getByRole('link', { name: /Devis/ }).click()
  await expect(page).toHaveURL(/\/devis$/)
  // Sur la page de devis, le bouton « Devis » disparaît de la barre (déjà sur place).
  await expect(bar.getByRole('link', { name: /Devis/ })).toHaveCount(0)
})
