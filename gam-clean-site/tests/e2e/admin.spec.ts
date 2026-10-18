// ============================================================================
// Back-office : scénario complet, dans l'ordre réel d'utilisation.
// S'exécute après les tests publics (qui ont créé des demandes).
// ============================================================================
import { expect, test, type Browser, type Page } from '@playwright/test'
import { collectPageErrors, expectNoSeriousA11yViolations, ownerAccount, testDb } from './helpers'

test.describe.configure({ mode: 'serial' })

const owner = ownerAccount()
const ownerNewPassword = 'une phrase de passe très longue 2026'
const sales = { email: 'commercial.e2e@example.test', name: 'Commercial E2E', password: '', newPassword: 'mot de passe du commercial 2026' }
let page: Page
let invitationLink = ''
let pageErrors: string[] = []

async function login(p: Page, email: string, password: string) {
  await p.goto('/admin/connexion')
  await p.getByLabel('Adresse e-mail').fill(email)
  await p.getByLabel('Mot de passe').fill(password)
  await p.getByRole('button', { name: 'Se connecter' }).click()
}

async function logout(p: Page) {
  await p.getByRole('button', { name: 'Se déconnecter' }).click()
  await expect(p).toHaveURL(/\/admin\/connexion\?deconnecte=1$/)
}

async function changeFirstPassword(p: Page, current: string, next: string) {
  await expect(p).toHaveURL(/\/admin\/compte\?premiere=1$/)
  await p.getByLabel('Mot de passe provisoire').fill(current)
  await p.getByLabel('Nouveau mot de passe').fill(next)
  await p.getByLabel('Confirmation').fill(next)
  await p.getByRole('button', { name: 'Enregistrer le mot de passe' }).click()
  await expect(p).toHaveURL(/\/admin\?bienvenue=1$/)
}

test.beforeAll(async ({ browser }: { browser: Browser }) => {
  page = await browser.newPage()
  pageErrors = collectPageErrors(page)
})

test.afterAll(async () => {
  await page.close()
})

test('accès protégé : redirection vers la connexion avec retour prévu', async () => {
  await page.goto('/admin/demandes?statut=new')
  await expect(page).toHaveURL(/\/admin\/connexion\?suite=%2Fadmin%2Fdemandes%3Fstatut%3Dnew$/)
  await expect(page.getByRole('heading', { name: 'Back-office' })).toBeVisible()
})

test('mauvais mot de passe : message générique', async () => {
  await login(page, owner.email, 'mauvais mot de passe')
  await expect(page.getByRole('alert').filter({ hasText: 'Identifiants incorrects' })).toBeVisible()
  // La saisie de l'e-mail est conservée après l'erreur.
  await expect(page.getByLabel('Adresse e-mail')).toHaveValue(owner.email)
})

test('première connexion : changement de mot de passe obligatoire', async () => {
  await login(page, owner.email, owner.password)
  // Tant que le mot de passe provisoire n'est pas changé, les autres pages renvoient ici.
  await changeFirstPassword(page, owner.password, ownerNewPassword)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bonjour Propriétaire E2E')
  await expect(page.getByText('Mot de passe enregistré')).toBeVisible()
})

test('tableau de bord : indicateurs et informations à compléter', async () => {
  await page.goto('/admin')
  await expect(page.getByRole('link', { name: /Nouvelles demandes/ })).toContainText('3')
  await expect(page.getByRole('region', { name: 'Dernières demandes' })).toContainText('Claire Fontaine')
  await expect(page.getByRole('region', { name: 'Informations à compléter' })).toContainText('Forme juridique')
  await expect(page.getByRole('navigation', { name: 'Navigation du back-office' }).getByRole('link', { name: /Demandes/ })).toContainText('3')
})

test('demandes : recherche sans accents, filtres et onglets', async () => {
  await page.goto('/admin/demandes')
  const rows = page.locator('table tbody tr')
  await expect(rows).toHaveCount(3)
  await page.getByLabel('Rechercher').fill('NOISY')
  await page.getByRole('button', { name: 'Filtrer' }).click()
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText('Claire Fontaine')
  await page.getByRole('link', { name: 'Effacer' }).click()
  await page.getByLabel('Type').selectOption({ label: 'Message' })
  await page.getByRole('button', { name: 'Filtrer' }).click()
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText('Paul Contact')
  await page.goto('/admin/demandes?statut=won')
  await expect(page.getByText('Aucune demande ne correspond')).toBeVisible()
})

test('fiche d’une demande : statut, note, suivi et historique', async () => {
  await page.goto('/admin/demandes')
  await page.getByRole('link', { name: 'Claire Fontaine' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Claire Fontaine')
  await expect(page.getByRole('region', { name: 'Détails de la demande' })).toContainText('1 250 m²')

  await page.getByLabel('Statut').selectOption({ label: 'Gagnée' })
  await page.getByRole('button', { name: 'Mettre à jour' }).click()
  await expect(page.getByText('Statut mis à jour.')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Historique' })).toContainText('Statut : Nouvelle → Gagnée')

  await page.getByLabel('Ajouter une note interne').fill('Visite fixée mardi à 9 h.')
  await page.getByRole('button', { name: 'Enregistrer la note' }).click()
  await expect(page.getByText('Note ajoutée.')).toBeVisible()
  await expect(page.getByLabel('Ajouter une note interne')).toHaveValue('') // formulaire vidé après succès
  await expect(page.getByRole('region', { name: 'Historique' })).toContainText('Visite fixée mardi à 9 h.')

  await page.getByLabel('Suivi par').selectOption({ label: 'Propriétaire E2E' })
  await page.getByRole('button', { name: 'Assigner' }).click()
  await expect(page.getByRole('region', { name: 'Historique' })).toContainText('Suivi confié à Propriétaire E2E')

  // L'historique est écrit par la base (triggers) avec l'auteur de chaque action.
  const sql = testDb()
  try {
    const events = await sql<{ kind: string; actor: string | null }[]>`
      select e.kind, u.display_name as actor from gam.lead_events e
      join gam.leads l on l.id = e.lead_id left join gam.admin_users u on u.id = e.actor_id
      where l.name = 'Claire Fontaine' order by e.id`
    expect(events.map((e) => e.kind)).toEqual(['status_change', 'note', 'assignment'])
    expect(new Set(events.map((e) => e.actor))).toEqual(new Set(['Propriétaire E2E']))
  } finally {
    await sql.end()
  }
})

test('invitation à laisser un avis (demande gagnée)', async () => {
  const panel = page.getByRole('region', { name: 'Avis client' })
  await panel.getByLabel('Envoyer le lien par e-mail').uncheck()
  await panel.getByRole('button', { name: 'Créer l’invitation' }).click()
  const link = panel.getByLabel('Lien personnel à transmettre au client')
  await expect(link).toHaveValue(/\/avis\/[A-Za-z0-9_-]{43}$/)
  invitationLink = await link.inputValue()
})

test('dépôt d’un avis par le client : lien personnel à usage unique', async ({ browser }) => {
  const client = await browser.newPage()
  try {
    await client.goto(new URL(invitationLink).pathname)
    await expect(client.getByText('Bonjour Claire Fontaine')).toBeVisible()
    await client.getByRole('button', { name: 'Envoyer mon avis' }).click()
    await expect(client.getByText('Choisissez une note globale')).toBeVisible()
    await client.getByLabel('Votre commentaire').fill('Équipe ponctuelle et travail soigné, merci !')
    await expect(client.getByLabel('Votre commentaire')).toHaveValue('Équipe ponctuelle et travail soigné, merci !')
    await client.getByRole('group', { name: /Votre note globale/ }).getByRole('radio', { name: '5 sur 5' }).check()
    await client.getByLabel('Nom affiché').fill('Claire F.')
    await client.getByRole('checkbox', { name: /J’accepte que mon avis/ }).check()
    await client.getByRole('button', { name: 'Envoyer mon avis' }).click()
    await expect(client.getByRole('heading', { name: 'Merci Claire Fontaine !' })).toBeVisible()
    // Deuxième utilisation du même lien : refusée.
    await client.goto(new URL(invitationLink).pathname)
    await expect(client.getByRole('heading', { name: 'Ce lien n’est plus valide' })).toBeVisible()
    // Un jeton inventé n'ouvre rien.
    await client.goto('/avis/' + 'A'.repeat(43))
    await expect(client.getByRole('heading', { name: 'Ce lien n’est plus valide' })).toBeVisible()
  } finally {
    await client.close()
  }
})

test('modération : l’avis publié apparaît sur le site', async ({ browser }) => {
  await page.goto('/admin/avis')
  const review = page.locator('article').filter({ hasText: 'Équipe ponctuelle et travail soigné' })
  await expect(review).toContainText('Publication autorisée')
  await review.getByRole('button', { name: 'Publier' }).click()
  await expect(page.getByText('Avis publié sur le site.')).toBeVisible()

  const visitor = await browser.newPage()
  try {
    await visitor.goto('/')
    await expect(visitor.getByRole('heading', { name: 'Ce qu’en disent nos clients' })).toBeVisible()
    await expect(visitor.getByText('Équipe ponctuelle et travail soigné, merci !')).toBeVisible()
    await expect(visitor.getByRole('img', { name: 'Note : 5 sur 5' })).toBeVisible()
  } finally {
    await visitor.close()
  }
})

test('contenus : erreur de saisie conservée, puis publication immédiate', async ({ browser }) => {
  await page.goto('/admin/contenu/coordonnees')
  await page.getByLabel('Délai de réponse').fill('sous 48 heures ouvrées')
  await page.getByLabel('SIRET').fill('123')
  await page.getByRole('button', { name: 'Enregistrer et publier' }).click()
  await expect(page.getByText('Le SIRET comporte 14 chiffres.')).toBeVisible()
  await expect(page.getByLabel('Délai de réponse')).toHaveValue('sous 48 heures ouvrées') // saisie non perdue
  await page.getByLabel('SIRET').fill('103 309 571 00018')
  await page.getByRole('button', { name: 'Enregistrer et publier' }).click()
  await expect(page.getByText('Modifications enregistrées et publiées sur le site.')).toBeVisible()

  const visitor = await browser.newPage()
  try {
    await visitor.goto('/devis')
    await expect(visitor.getByText('Sous 48 heures ouvrées, pour préciser votre besoin.')).toBeVisible()
  } finally {
    await visitor.close()
  }
})

test('prestations : création (page publique générée à la demande) puis suppression', async ({ browser }) => {
  await page.goto('/admin/contenu/prestations/nouvelle')
  await page.getByLabel('Nom (menus, cartes)').fill('Désinfection E2E')
  await page.getByLabel('Résumé (une phrase)').fill('Prestation de démonstration créée par les tests automatiques.')
  await page.getByLabel('Titre de la page (H1)').fill('Désinfection de locaux (test)')
  await page.getByLabel('Introduction').fill('Page créée par un test de bout en bout.')
  await page.getByLabel('Titre Google').fill('Désinfection de locaux – test automatique')
  await page.getByLabel('Description Google').fill('Description de démonstration suffisamment longue pour respecter les contraintes de référencement.')
  await page.getByLabel('Publiée sur le site').check()
  await page.getByRole('button', { name: 'Créer la prestation' }).click()
  await expect(page).toHaveURL(/\/admin\/contenu\/prestations\/\d+\?cree=1$/)
  await expect(page.getByText('Prestation créée.')).toBeVisible()

  const visitor = await browser.newPage()
  try {
    const res = await visitor.goto('/prestations/desinfection-e2e')
    expect(res?.status()).toBe(200)
    await expect(visitor.getByRole('heading', { level: 1 })).toHaveText('Désinfection de locaux (test)')
    await visitor.goto('/prestations')
    await expect(visitor.getByRole('link', { name: 'Désinfection E2E' }).first()).toBeVisible()
  } finally {
    await visitor.close()
  }

  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Supprimer' }).click()
  await expect(page).toHaveURL(/\/admin\/contenu\/prestations\?supprimee=1$/)
  const after = await browser.newPage()
  try {
    expect((await after.goto('/prestations/desinfection-e2e'))?.status()).toBe(404)
  } finally {
    await after.close()
  }
})

test('export CSV : réservé, lisible dans Excel, formules neutralisées', async ({ playwright }) => {
  const sql = testDb()
  try {
    await sql`
      insert into gam.leads (type, name, email, message)
      values ('contact', '=HYPERLINK("http://exemple.test")', 'formule@example.com', 'Tentative d''injection de formule')`
  } finally {
    await sql.end()
  }
  const res = await page.request.get('/api/admin/export/demandes')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('text/csv')
  expect(res.headers()['content-disposition']).toMatch(/attachment; filename="demandes-gam-clean-\d{4}-\d{2}-\d{2}\.csv"/)
  const body = await res.text()
  expect(body.charCodeAt(0)).toBe(0xfeff) // BOM UTF-8 pour Excel
  expect(body).toContain('N°;Date;Type;Statut;Nom')
  expect(body).toContain('claire.fontaine@example.com')
  expect(body).toContain(`"'=HYPERLINK(""http://exemple.test"")"`)

  const anonymous = await playwright.request.newContext({ baseURL: test.info().project.use.baseURL })
  expect((await anonymous.get('/api/admin/export/demandes')).status()).toBe(401)
  await anonymous.dispose()
})

test('comptes : création d’un commercial (mot de passe provisoire affiché une fois)', async () => {
  await page.goto('/admin/utilisateurs')
  const panel = page.getByRole('region', { name: 'Nouveau compte' })
  await panel.getByLabel('Nom affiché').fill(sales.name)
  await panel.getByLabel('E-mail').fill(sales.email)
  await panel.getByLabel('Rôle').selectOption('sales')
  await panel.getByRole('button', { name: 'Créer le compte' }).click()
  const secret = panel.locator('code, span').filter({ hasText: /^[A-Za-z0-9]{20}$/ })
  await expect(secret).toBeVisible()
  sales.password = (await secret.innerText()).trim()
  await logout(page)
})

test('rôle commercial : pas d’accès aux contenus ni aux comptes', async () => {
  await login(page, sales.email, sales.password)
  await changeFirstPassword(page, sales.password, sales.newPassword)
  const nav = page.getByRole('navigation', { name: 'Navigation du back-office' })
  await expect(nav.getByRole('link', { name: /Demandes/ })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Contenu du site' })).toHaveCount(0)
  await expect(nav.getByRole('link', { name: 'Utilisateurs' })).toHaveCount(0)
  for (const path of ['/admin/contenu', '/admin/utilisateurs', '/admin/journal', '/admin/avis']) {
    await page.goto(path)
    await expect(page, path).toHaveURL(/\/admin\?acces=refuse$/)
  }
  await expect(page.getByText('Votre rôle ne donne pas accès à cette page.')).toBeVisible()
  await logout(page)
})

test('verrouillage après 5 échecs : même le bon mot de passe est refusé', async () => {
  for (let i = 0; i < 5; i++) {
    await login(page, sales.email, `faux-${i}`)
    await expect(page.getByRole('alert').filter({ hasText: 'Identifiants incorrects' })).toBeVisible()
  }
  await login(page, sales.email, sales.newPassword)
  await expect(page.getByRole('alert').filter({ hasText: 'Identifiants incorrects' })).toBeVisible()
  const sql = testDb()
  try {
    const [u] = await sql<{ locked: boolean }[]>`
      select locked_until > now() as locked from gam.admin_users where email = ${sales.email}`
    expect(u.locked).toBe(true)
  } finally {
    await sql.end()
  }
})

test('journal : actions tracées avec leur auteur', async () => {
  await login(page, owner.email, ownerNewPassword)
  await expect(page).toHaveURL(/\/admin$/)
  await page.goto('/admin/journal')
  const table = page.locator('table')
  for (const label of ['Connexion', 'Échec de connexion', 'Statut d’une demande', 'Export CSV des demandes', 'Création d’un compte', 'Modération d’un avis']) {
    await expect(table.getByText(label, { exact: true }).first(), label).toBeVisible()
  }
})

for (const path of ['/admin', '/admin/demandes', '/admin/avis', '/admin/contenu/coordonnees', '/admin/contenu/prestations', '/admin/utilisateurs']) {
  test(`accessibilité ${path}`, async () => {
    await page.goto(path)
    await expectNoSeriousA11yViolations(page)
  })
}

test('déconnexion : session supprimée en base', async () => {
  await page.goto('/admin')
  await logout(page)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/connexion/)
  const sql = testDb()
  try {
    const [{ n }] = await sql<{ n: number }[]>`
      select count(*)::int as n from gam.admin_sessions s join gam.admin_users u on u.id = s.user_id
      where u.email = ${owner.email}`
    expect(n).toBe(0)
  } finally {
    await sql.end()
  }
  expect(pageErrors.filter((e) => !e.includes('Failed to load resource'))).toEqual([])
})
