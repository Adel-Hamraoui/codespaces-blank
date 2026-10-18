// ============================================================================
// Site public : contenus issus de la base, formulaire de devis en étapes,
// envoi sans JavaScript, recherche FAQ, erreurs 404, en-têtes, accessibilité.
// ============================================================================
import { expect, test } from '@playwright/test'
import { collectPageErrors, expectNoSeriousA11yViolations, testDb, waitAntiSpamDelay } from './helpers'

test.describe.configure({ mode: 'serial' })

test('accueil : contenus de la base, raccourcis de demande, sans erreur JavaScript', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Des locaux professionnels')
  // Prestations publiées (base) : 7 raccourcis et 7 liens dans la grille.
  const shortcuts = page.getByRole('navigation', { name: 'Démarrer une demande pour…' }).getByRole('link')
  await expect(shortcuts).toHaveCount(7)
  await expect(page.getByRole('region', { name: 'Repères' })).toContainText('7')
  await expect(page.getByRole('link', { name: 'Vitres et façades' }).first()).toBeVisible()
  // Aucun avis publié au départ : la section reste masquée (rien d'inventé).
  await expect(page.getByRole('heading', { name: 'Ce qu’en disent nos clients' })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('raccourci de l’accueil : la prestation est présélectionnée dans le devis', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Démarrer une demande pour…' }).getByRole('link', { name: 'Vitres et façades' }).click()
  await expect(page).toHaveURL(/\/devis\?prestation=vitres-et-facades$/)
  await expect(page.getByRole('checkbox', { name: 'Vitres et façades' })).toBeChecked()
})

test('devis en trois étapes : validation par étape, Entrée, retour, récapitulatif, envoi', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/devis')
  const steps = page.getByRole('list', { name: 'Étapes de la demande' })
  await expect(steps.getByRole('listitem')).toHaveCount(3)

  // Étape 1 : aucune prestation choisie → erreur, on reste sur l'étape.
  await page.getByRole('button', { name: 'Continuer' }).click()
  await expect(page.locator('form [role=alert]')).toContainText('Sélectionnez au moins une prestation')
  await expect(page.getByRole('group', { name: /Votre besoin/ })).toBeVisible()
  await page.getByRole('checkbox', { name: 'Nettoyage de bureaux' }).check()
  await page.getByRole('radio', { name: 'Entretien régulier' }).check()
  await page.getByRole('button', { name: 'Continuer' }).click()

  // Étape 2 : seule l'étape courante est visible.
  await expect(page.getByRole('group', { name: /Votre besoin/ })).toBeHidden()
  await expect(page.getByLabel('Ville ou code postal des locaux')).toBeVisible()
  await page.getByLabel('Surface approximative').fill('abc')
  await page.getByLabel('Ville ou code postal des locaux').fill('Noisy-le-Sec')
  await page.getByLabel('Ville ou code postal des locaux').press('Enter')
  await expect(page.locator('form [role=alert]')).toContainText('Indiquez une surface en m²')
  await page.getByLabel('Surface approximative').fill('1 250 m²')
  await page.getByLabel('Surface approximative').press('Enter') // Entrée = étape suivante

  // Étape 3 : aucune erreur affichée avant toute tentative d'envoi.
  await expect(page.getByLabel('Nom et prénom')).toBeVisible()
  await expect(page.locator('form [role=alert]')).toHaveCount(0)
  await expect(page.getByText('Votre demande', { exact: true }).locator('..')).toContainText('Nettoyage de bureaux')

  // Retour puis Continuer : la saisie est conservée.
  await page.getByRole('button', { name: 'Retour' }).click()
  await expect(page.getByLabel('Ville ou code postal des locaux')).toHaveValue('Noisy-le-Sec')
  await page.getByRole('button', { name: 'Continuer' }).click()

  await page.getByLabel('Nom et prénom').fill('Claire Fontaine')
  await page.getByLabel('Téléphone').fill('06 98 76 54 32')
  await page.getByLabel('E-mail').fill('Claire.Fontaine@Example.com')
  await waitAntiSpamDelay(page)
  await page.getByRole('button', { name: 'Envoyer ma demande de devis' }).click()
  await expect(page).toHaveURL(/\/merci\?demande=devis$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Merci')

  // La demande est enregistrée, normalisée, avec sa prestation.
  const sql = testDb()
  try {
    const [lead] = await sql`
      select l.email, l.phone_e164, l.location, l.surface_m2, l.frequency, l.source_path,
             array(select s.slug from gam.lead_services ls join gam.services s on s.id = ls.service_id where ls.lead_id = l.id) as slugs
      from gam.leads l where l.name = 'Claire Fontaine'`
    expect(lead).toMatchObject({
      email: 'claire.fontaine@example.com',
      phone_e164: '+33698765432',
      location: 'Noisy-le-Sec',
      surface_m2: 1250,
      frequency: 'recurring',
      source_path: '/devis',
      slugs: ['nettoyage-de-bureaux'],
    })
  } finally {
    await sql.end()
  }
  expect(errors).toEqual([])
})

test('formulaire de contact : envoi simple', async ({ page }) => {
  await page.goto('/contact')
  await page.getByLabel('Nom et prénom').fill('Paul Contact')
  await page.getByLabel('E-mail').fill('paul.contact@example.com')
  await page.getByLabel('Votre message').fill('Bonjour, je souhaite être rappelé pour un besoin ponctuel.')
  await waitAntiSpamDelay(page)
  await page.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(page).toHaveURL(/\/merci\?demande=contact$/)
})

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('toutes les étapes sont visibles et l’envoi classique fonctionne', async ({ page }) => {
    await page.goto('/devis')
    await expect(page.getByRole('list', { name: 'Étapes de la demande' })).toHaveCount(0)
    await page.getByRole('checkbox', { name: 'Fin de chantier' }).check()
    await page.getByLabel('Ville ou code postal des locaux').fill('Bobigny')
    await page.getByLabel('Nom et prénom').fill('Sans Javascript')
    await page.getByLabel('Téléphone').fill('0712345678')
    await page.getByLabel('E-mail').fill('sans.js@example.com')
    await page.getByRole('button', { name: 'Envoyer ma demande de devis' }).click()
    await expect(page).toHaveURL(/\/merci\?demande=devis$/)
  })

  test('envoi incomplet : page de repli avec les coordonnées', async ({ page }) => {
    await page.goto('/contact')
    await page.getByLabel('Nom et prénom').fill('Incomplet')
    await page.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(page).toHaveURL(/\/envoi-impossible$/)
    await expect(page.getByRole('main').getByRole('link', { name: /07 51 37 94 55/ }).first()).toBeVisible()
  })
})

test('FAQ : recherche instantanée', async ({ page }) => {
  await page.goto('/faq')
  const search = page.getByLabel('Rechercher une question')
  await search.fill('zones')
  await expect(page.getByRole('status').filter({ hasText: 'question' })).toContainText('sur')
  await expect(page.getByText('Dans quelles zones intervenez-vous ?')).toBeVisible()
  await search.fill('xyzxyz')
  await expect(page.getByText('Votre question n’y figure pas ?')).toBeVisible()
})

test('prestation inconnue et page inconnue : vraie erreur 404', async ({ page }) => {
  for (const path of ['/prestations/n-existe-pas', '/page-inexistante']) {
    const res = await page.goto(path)
    expect(res?.status(), path).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Cette page n’existe pas')
  }
})

test('en-têtes de sécurité et indexation', async ({ request }) => {
  const home = await request.get('/')
  const h = home.headers()
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(h['x-content-type-options']).toBe('nosniff')
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
  const admin = await request.get('/admin/connexion')
  expect(admin.headers()['x-robots-tag']).toBe('noindex, nofollow')
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toContain('Disallow: /admin')
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('/prestations/vitres-et-facades')
  expect(sitemap).not.toContain('/admin')
})

test('API : origine étrangère refusée, données invalides détaillées', async ({ request }) => {
  const foreign = await request.post('/api/demande', { headers: { Origin: 'https://exemple-malveillant.test' }, data: {} })
  expect(foreign.status()).toBe(403)
  const invalid = await request.post('/api/demande', { data: { type: 'devis', name: 'A', email: 'pas-un-email' } })
  expect(invalid.status()).toBe(422)
  const body = await invalid.json()
  expect(Object.keys(body.errors)).toEqual(expect.arrayContaining(['name', 'email', 'services', 'location', 'phone']))
})

test('tâche de maintenance : refusée sans le secret', async ({ request }) => {
  expect((await request.get('/api/cron/maintenance')).status()).toBe(401)
  const ok = await request.get('/api/cron/maintenance', { headers: { Authorization: 'Bearer cron-de-test-e2e' } })
  expect(ok.status()).toBe(200)
  expect(await ok.json()).toMatchObject({ ok: true })
})

for (const path of ['/', '/devis', '/contact', '/faq', '/prestations/nettoyage-de-bureaux', '/secteurs', '/a-propos', '/mentions-legales']) {
  test(`accessibilité ${path}`, async ({ page }) => {
    await page.goto(path)
    await expectNoSeriousA11yViolations(page)
  })
}
