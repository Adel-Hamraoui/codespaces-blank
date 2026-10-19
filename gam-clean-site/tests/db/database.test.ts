// ============================================================================
// Tests d'intégration PostgreSQL (npm run test:db).
// Prérequis : TEST_DATABASE_URL vers une base dédiée dont le nom se termine par
// _test (elle est vidée). Vérifie le schéma, l'intégrité, les triggers, le
// cloisonnement des droits et les requêtes du back-office.
// ============================================================================
import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import { createSql, type Sql } from '../../backend/db/client'
import { MIGRATIONS_DIR, migrate } from '../../backend/db/migrate'
import { seed } from '../../backend/db/seed'
import { countByStatus, dashboardStats, getLead, insertLead, listLeads } from '../../backend/modules/leads/repository'
import type { ValidRequest } from '../../shared/validation/request'

const url = process.env.TEST_DATABASE_URL
if (!url || !/_test$/.test(new URL(url).pathname)) {
  throw new Error('TEST_DATABASE_URL doit désigner une base dont le nom se termine par _test (elle est vidée).')
}

let sql: Sql

const lead = (over: Partial<ValidRequest> = {}): ValidRequest => ({
  type: 'devis',
  frequency: 'recurring',
  profile: 'company',
  location: 'Bondy',
  message: '',
  name: 'Client Test',
  company: '',
  email: 'client@exemple.fr',
  sourcePath: '/devis',
  serviceSlugs: [],
  otherNeed: false,
  surfaceM2: 100,
  phoneE164: '+33612345678',
  ...over,
})

/** Exécute une requête qui doit échouer avec le code SQLSTATE attendu. */
async function rejects(code: string, run: () => Promise<unknown>) {
  await assert.rejects(run, (e: { code?: string }) => {
    assert.equal(e.code, code)
    return true
  })
}

// Rôles publics de Supabase : créés (sans connexion) s'ils manquent, pour que
// le cloisonnement soit réellement vérifié sur une base PostgreSQL ordinaire.
const SUPABASE_ROLES = ['anon', 'authenticated', 'service_role']

before(async () => {
  sql = createSql(url, 2)
  for (const role of SUPABASE_ROLES) {
    await sql
      .unsafe(`do $$ begin if not exists (select 1 from pg_roles where rolname = '${role}') then create role ${role} nologin; end if; end $$`)
      .catch(() => {}) // droits insuffisants : le test correspondant sera signalé comme ignoré
  }
  await sql.unsafe('drop schema if exists gam cascade')
  await migrate(sql)
  await seed(sql)
})

after(async () => {
  await sql.end()
})

describe('migrations et contenu initial', () => {
  it('relancer les migrations ne fait rien', async () => {
    assert.deepEqual(await migrate(sql), [])
  })

  it('une migration modifiée après application est détectée', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'migrations-'))
    cpSync(MIGRATIONS_DIR, dir, { recursive: true })
    const file = path.join(dir, '0002_functions.sql')
    writeFileSync(file, readFileSync(file, 'utf8') + '\n-- modification\n')
    await assert.rejects(migrate(sql, { dir }), /modifiée après son application/)
  })

  it('le contenu initial est idempotent et n’écrase rien', async () => {
    await sql`update gam.claims set title = 'Titre modifié' where key = 'freeQuote'`
    const report = await seed(sql)
    assert.deepEqual(report, { settings: 0, claims: 0, services: 0, relations: 0, faq: 0, sectors: 0 })
    const [{ title }] = await sql`select title from gam.claims where key = 'freeQuote'`
    assert.equal(title, 'Titre modifié')
    const [counts] = await sql`
      select (select count(*)::int from gam.services) as services,
             (select count(*)::int from gam.faq_items where service_id is null) as faq,
             (select count(*)::int from gam.sectors) as sectors`
    assert.deepEqual(counts, { services: 7, faq: 11, sectors: 6 })
  })
})

describe('intégrité garantie par la base', () => {
  it('une demande de devis exige ville et téléphone, un message de contact exige un texte', async () => {
    await rejects('23514', () => sql`insert into gam.leads (type, name, email, phone_e164) values ('quote', 'Ana', 'ana@exemple.fr', '+33612345678')`)
    await rejects('23514', () => sql`insert into gam.leads (type, name, email, location) values ('quote', 'Ana', 'ana@exemple.fr', 'Paris')`)
    await rejects('23514', () => sql`insert into gam.leads (type, name, email) values ('contact', 'Ana', 'ana@exemple.fr')`)
    await rejects('23514', () => sql`insert into gam.leads (type, name, email, message) values ('contact', 'Ana', 'Ana@Exemple.fr', 'Bonjour, merci.')`)
    await rejects('23514', () => sql`insert into gam.leads (type, name, email, message, phone_e164) values ('contact', 'Ana', 'ana@exemple.fr', 'Bonjour, merci.', '0612345678')`)
  })

  it('les coordonnées n’existent qu’en un exemplaire', async () => {
    await rejects('23514', () => sql`insert into gam.site_settings (id, company_name, legal_name, siret, phone_display, phone_e164, email, postal_code, city, department, department_code, region, service_area_short, service_area_long)
      values (false, 'X', 'XX', '12345678901234', '01 02 03 04 05', '+33102030405', 'a@b.fr', '75001', 'Paris', 'Paris', '75', 'IDF', 'Paris', 'Partout à Paris.')`)
  })

  it('un avis ne peut être publié sans consentement, et son contenu est immuable', async () => {
    const [r] = await sql`
      insert into gam.reviews (rating, consent_publish, author_name, comment)
      values (4, false, 'Léa', 'Bonne prestation, équipe ponctuelle.') returning id`
    await rejects('23514', () => sql`update gam.reviews set status = 'published' where id = ${r.id}`)
    await rejects('P0001', () => sql`update gam.reviews set comment = 'Avis réécrit' where id = ${r.id}`)
    await sql`update gam.reviews set status = 'rejected' where id = ${r.id}`
    const [m] = await sql`select moderated_at is not null as moderated from gam.reviews where id = ${r.id}`
    assert.equal(m.moderated, true)
  })

  it('une prestation déjà demandée ne peut pas être supprimée', async () => {
    const [service] = await sql`select id from gam.services where slug = 'vitres-et-facades'`
    await sql.begin((tx) => insertLead(tx, lead({ email: 'restrict@exemple.fr' }), [service.id]))
    await rejects('23503', () => sql`delete from gam.services where id = ${service.id}`)
  })
})

describe('historique automatique (triggers)', () => {
  it('statut et assignation sont journalisés avec leur auteur', async () => {
    const [u] = await sql`
      insert into gam.admin_users (email, display_name, role, password_hash)
      values ('equipe@exemple.fr', 'Équipe', 'editor', 'scrypt$17$8$1$x$y') returning id`
    const id = await sql.begin((tx) => insertLead(tx, lead({ email: 'historique@exemple.fr' }), []))
    await sql.begin(async (tx) => {
      await tx`select set_config('gam.actor_id', ${String(u.id)}, true)`
      await tx`update gam.leads set status = 'in_progress', assigned_to = ${u.id} where id = ${id}`
    })
    await sql`update gam.leads set message = 'sans effet sur l''historique' where id = ${id}`
    const events = await sql`select kind, from_status, to_status, actor_id from gam.lead_events where lead_id = ${id} order by id`
    assert.deepEqual(
      events.map((e) => [e.kind, e.from_status, e.to_status, e.actor_id]),
      [
        ['status_change', 'new', 'in_progress', u.id],
        ['assignment', null, null, u.id],
      ]
    )
    const detail = await getLead(sql, id)
    assert.equal(detail?.assignedTo, 'Équipe')
    assert.ok(detail && detail.statusChangedAt >= detail.createdAt)
  })
})

describe('cloisonnement des accès', () => {
  it('les rôles publics de Supabase n’ont aucun droit sur les données', async (t) => {
    const present = await sql`select rolname from pg_roles where rolname in ${sql(SUPABASE_ROLES)}`
    if (present.length < SUPABASE_ROLES.length) return t.skip('rôles de Supabase absents et impossibles à créer')
    for (const role of SUPABASE_ROLES) {
      await rejects('42501', () =>
        sql.begin(async (tx) => {
          await tx.unsafe(`set local role ${role}`)
          await tx`select count(*) from gam.leads`
        })
      )
    }
  })

  it('le rôle applicatif lit et écrit, mais pas le registre des migrations', async () => {
    await sql.begin(async (tx) => {
      await tx.unsafe('set local role gam_app')
      const [r] = await tx`select count(*)::int as n from gam.services`
      assert.equal(r.n, 7)
    })
    await rejects('42501', () =>
      sql.begin(async (tx) => {
        await tx.unsafe('set local role gam_app')
        await tx`select * from gam.schema_migrations`
      })
    )
  })

  it('la sécurité au niveau des lignes est active sur toutes les tables', async () => {
    const rows = await sql`
      select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'gam' and c.relkind = 'r' and not c.relrowsecurity`
    assert.deepEqual(rows.map((r) => r.relname), [])
  })
})

describe('requêtes du back-office', () => {
  before(async () => {
    // 60 demandes dont 20 partagent exactement le même horodatage (cas limite du curseur).
    await sql`
      insert into gam.leads (created_at, type, name, email, location, phone_e164, status)
      select case when g <= 20 then '2026-01-15 10:00:00+01'::timestamptz
                  else '2026-01-15 10:00:00+01'::timestamptz - make_interval(mins => g) end,
             'quote', 'Pagination ' || g, 'pagination' || g || '@exemple.fr', 'Évry-Courcouronnes', '+33612345678',
             (array['new', 'won', 'lost'])[1 + g % 3]::gam.lead_status
      from generate_series(1, 60) g`
  })

  it('la pagination par curseur parcourt chaque demande une seule fois, dans l’ordre', async () => {
    const seen: string[] = []
    let cursor: string | null = null
    do {
      const page = await listLeads(sql, { q: 'pagination' }, cursor, 7)
      seen.push(...page.items.map((i) => i.id))
      cursor = page.nextCursor
    } while (cursor)
    assert.equal(seen.length, 60)
    assert.equal(new Set(seen).size, 60)
    // Tri numérique sur la colonne (et non sur un alias texte, qui trierait « 9 » avant « 27 »).
    const ordered = await sql`select l.id from gam.leads l where l.name like 'Pagination %' order by l.created_at desc, l.id desc`
    assert.deepEqual(seen, ordered.map((r) => String(r.id)))
  })

  it('recherche insensible aux accents et à la casse, caractères spéciaux neutralisés', async () => {
    assert.equal((await listLeads(sql, { q: 'EVRY-courcouronnes' }, null, 100)).items.length, 60)
    assert.equal((await listLeads(sql, { q: 'pagination 7' }, null, 100)).items.length, 1)
    assert.equal((await listLeads(sql, { q: '%%' }, null, 100)).items.length, 0) // pas de joker SQL
    assert.equal((await listLeads(sql, { q: '_agination' }, null, 100)).items.length, 0)
  })

  it('filtres combinés et compteurs par statut', async () => {
    const won = await listLeads(sql, { q: 'pagination', status: 'won' }, null, 100)
    assert.equal(won.items.length, 20)
    assert.ok(won.items.every((i) => i.status === 'won'))
    const day = await listLeads(sql, { q: 'pagination', from: '2026-01-15', to: '2026-01-15' }, null, 100)
    assert.equal(day.items.length, 60)
    assert.equal((await listLeads(sql, { q: 'pagination', from: '2026-01-16' }, null, 100)).items.length, 0)
    const counts = await countByStatus(sql)
    assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), (await sql`select count(*)::int as n from gam.leads`)[0].n)
    const stats = await dashboardStats(sql)
    assert.equal(stats.byStatus.won, counts.won)
  })
})

describe('maintenance (RGPD et hygiène)', () => {
  it('supprime les demandes inactives au-delà de la durée de conservation, et seulement elles', async () => {
    await sql`update gam.site_settings set lead_retention_months = 6`
    const oldId = await sql.begin((tx) => insertLead(tx, lead({ email: 'ancienne@exemple.fr' }), []))
    const recentId = await sql.begin((tx) => insertLead(tx, lead({ email: 'recente@exemple.fr' }), []))
    // Le trigger met updated_at à jour : on le désactive le temps de vieillir la ligne.
    await sql.begin(async (tx) => {
      await tx`alter table gam.leads disable trigger leads_before_update`
      await tx`update gam.leads set updated_at = now() - interval '7 months' where id = ${oldId}`
      await tx`alter table gam.leads enable trigger leads_before_update`
    })
    await sql`
      insert into gam.lead_events (lead_id, kind, body) values (${oldId}, 'note', 'note liée')`
    const [{ result }] = await sql`select gam.purge_expired_data() as result`
    assert.equal(result.retention_months, 6)
    assert.ok(result.leads >= 1)
    const remaining = await sql`select id::text from gam.leads where id in (${oldId}, ${recentId})`
    assert.deepEqual(remaining.map((r) => r.id), [recentId])
    const [{ n }] = await sql`select count(*)::int as n from gam.lead_events where lead_id = ${oldId}`
    assert.equal(n, 0) // historique supprimé en cascade
  })

  it('compteur anti-abus : incrémente dans la fenêtre, repart à 1 ensuite', async () => {
    const key = Buffer.alloc(32, 7)
    const hit = async () => (await sql`select gam.rate_limit_hit(${key}, interval '10 minutes') as n`)[0].n
    assert.deepEqual([await hit(), await hit(), await hit()], [1, 2, 3])
    await sql`update gam.rate_limits set window_start = now() - interval '11 minutes' where bucket_key = ${key}`
    assert.equal(await hit(), 1)
  })
})
