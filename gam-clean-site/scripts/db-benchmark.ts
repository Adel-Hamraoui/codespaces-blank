// ============================================================================
// Mesure des performances de la base (npm run db:benchmark).
// ----------------------------------------------------------------------------
// 1. Recrée le schéma dans une base de test (*_test, vidée) et génère un volume
//    réaliste de données (100 000 demandes par défaut, sur 3 ans).
// 2. Exécute les VRAIES requêtes de l'application (fonctions du backend) en
//    capturant leur SQL, puis les passe à EXPLAIN (ANALYZE, BUFFERS).
// 3. Affiche, pour chacune : index utilisé, temps d'exécution médian, pages lues.
// Usage : BENCH_DATABASE_URL=postgres://…/gam_test npm run db:benchmark [-- 100000]
// ============================================================================
import postgres from 'postgres'
import { migrate } from '../backend/db/migrate'
import { seed } from '../backend/db/seed'
import { listAudit } from '../backend/modules/audit/log'
import { fetchServiceBySlug, fetchSiteChrome } from '../backend/modules/content/repository'
import { countByStatus, countNewLeads, dashboardStats, getLead, listLeads, pendingNotifications } from '../backend/modules/leads/repository'

const url = process.env.BENCH_DATABASE_URL
if (!url || !/_test$/.test(new URL(url).pathname)) {
  console.error('BENCH_DATABASE_URL doit désigner une base dont le nom se termine par _test (elle est vidée).')
  process.exit(1)
}
const VOLUME = Number(process.argv[2] ?? 100_000)

let capture: { query: string; params: unknown[] }[] | null = null
const sql = postgres(url, {
  max: 1,
  prepare: false,
  onnotice: () => {},
  debug: (_conn, query, params) => capture?.push({ query, params: params as unknown[] }),
})

type PlanNode = { 'Node Type': string; 'Index Name'?: string; 'Relation Name'?: string; Plans?: PlanNode[] }

/** Index et parcours séquentiels utilisés dans un plan. */
function accessPaths(node: PlanNode, out = new Set<string>()) {
  if (node['Index Name']) out.add(`${node['Node Type']} ${node['Index Name']}`)
  else if (node['Node Type'] === 'Seq Scan') out.add(`Seq Scan ${node['Relation Name']}`)
  for (const child of node.Plans ?? []) accessPaths(child, out)
  return out
}

async function explainLast(label: string, run: () => Promise<unknown>) {
  capture = []
  await run()
  const queries = capture
  capture = null
  // La requête la plus coûteuse de l'appel (une fonction peut en exécuter plusieurs).
  const results = []
  for (const q of queries) {
    const times: number[] = []
    let plan: { Plan: PlanNode; 'Execution Time': number } | null = null
    let buffers = 0
    for (let i = 0; i < 5; i++) {
      const [row] = await sql.unsafe(`explain (analyze, buffers, format json) ${q.query}`, q.params as never[])
      const p = (row['QUERY PLAN'] as { Plan: PlanNode & { 'Shared Hit Blocks': number; 'Shared Read Blocks': number }; 'Execution Time': number }[])[0]
      times.push(p['Execution Time'])
      plan = p
      buffers = p.Plan['Shared Hit Blocks'] + p.Plan['Shared Read Blocks']
    }
    times.sort((a, b) => a - b)
    results.push({ median: times[2], paths: [...accessPaths(plan!.Plan)], buffers })
  }
  const worst = results.sort((a, b) => b.median - a.median)[0]
  const total = results.reduce((s, r) => s + r.median, 0)
  console.log(
    `| ${label} | ${queries.length} | ${total.toFixed(2)} ms | ${worst.buffers} | ${worst.paths.join(', ') || '—'} |`
  )
}

async function generate() {
  console.log(`Génération de ${VOLUME.toLocaleString('fr-FR')} demandes…`)
  const t0 = Date.now()
  await sql`
    insert into gam.admin_users (email, display_name, role, password_hash)
    select 'membre' || g || '@exemple.fr', 'Membre ' || g, 'sales', 'scrypt$17$8$1$x$y' from generate_series(1, 5) g`
  await sql`
    insert into gam.leads (created_at, updated_at, status_changed_at, notified_at, type, status, frequency, profile,
                           assigned_to, name, company, email, phone_e164, location, message, surface_m2, source_path)
    select ts, ts, ts, case when g % 200 = 0 then null else ts end,
           case when g % 4 = 0 then 'contact' else 'quote' end::gam.lead_type,
           (array['new','in_progress','quote_sent','won','lost','spam','won','lost'])[1 + g % 8]::gam.lead_status,
           case when g % 4 = 0 then null else (array['one_off','recurring','undecided'])[1 + g % 3]::gam.lead_frequency end,
           (array['company','retail','industry','condominium','public_sector','healthcare','construction','individual','other'])[1 + g % 9]::gam.client_profile,
           case when g % 3 = 0 then null else 1 + g % 5 end,
           (array['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon','Laurent','Lefèvre','Michel','García'])[1 + g % 15]
             || ' ' || (array['Camille','Léa','Hugo','Inès','Lucas','Chloé','Noé','Zoé'])[1 + g % 8] || ' ' || g,
           case when g % 2 = 0 then 'Société ' || (g % 5000) end,
           'contact' || g || '@exemple.fr',
           '+336' || lpad((g % 100000000)::text, 8, '0'),
           case when g % 4 = 0 then null else (array['Bondy','Montreuil','Évry-Courcouronnes','Saint-Denis','Créteil','Nanterre','Versailles','Paris 11e','Noisy-le-Grand','Aubervilliers'])[1 + g % 10] end,
           case when g % 4 = 0 then 'Message de contact numéro ' || g else null end,
           case when g % 4 = 0 then null else 50 + g % 5000 end,
           '/devis'
    -- Ordre chronologique (comme en production : les demandes arrivent au fil du temps).
    from (select g, now() - make_interval(mins => ((${VOLUME} - g) * 15) % (3 * 365 * 24 * 60)) as ts
          from generate_series(1, ${VOLUME}) g) s
    order by s.ts`
  await sql`
    insert into gam.lead_services (lead_id, service_id)
    select l.id, s.id from gam.leads l
    join lateral (select id from gam.services order by random() limit 1 + (l.id % 2)::int) s on true
    where l.type = 'quote'
    on conflict do nothing`
  await sql`
    insert into gam.lead_events (created_at, lead_id, kind, from_status, to_status, actor_id)
    select l.created_at + interval '1 day', l.id, 'status_change', 'new', l.status, 1 + l.id % 5
    from gam.leads l where l.status <> 'new'`
  await sql`
    insert into gam.lead_events (created_at, lead_id, kind, body, actor_id)
    select l.created_at + interval '2 hours', l.id, 'note', 'Appel passé, visite à planifier.', 1 + l.id % 5
    from gam.leads l where l.id % 2 = 0`
  await sql`
    insert into gam.audit_log (created_at, actor_id, action, entity_type, entity_id)
    select now() - make_interval(mins => ${VOLUME} - g), 1 + g % 5, 'lead.status', 'lead', g::text
    from generate_series(1, ${VOLUME}) g`
  await sql`vacuum analyze`.catch(() => sql`analyze`)
  console.log(`Données générées en ${((Date.now() - t0) / 1000).toFixed(1)} s.\n`)
}

try {
  await sql.unsafe('drop schema if exists gam cascade')
  await migrate(sql as never)
  await seed(sql as never)
  await generate()

  const sizes = await sql`
    select c.relname as table,
           pg_size_pretty(pg_relation_size(c.oid)) as donnees,
           pg_size_pretty(pg_indexes_size(c.oid)) as index,
           c.reltuples::bigint as lignes,
           case when c.reltuples > 0 then (pg_relation_size(c.oid) / c.reltuples)::int end as octets_par_ligne
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'gam' and c.relkind = 'r' and c.reltuples > 100
    order by pg_total_relation_size(c.oid) desc`
  console.log('| Table | Lignes | Données | Index | Octets par ligne (moy., en-têtes inclus) |')
  console.log('|---|---:|---:|---:|---:|')
  for (const s of sizes) console.log(`| ${s.table} | ${Number(s.lignes).toLocaleString('fr-FR')} | ${s.donnees} | ${s.index} | ${s.octets_par_ligne} |`)

  const [deep] = await sql`
    select to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as ts, id::text
    from gam.leads order by created_at desc, id desc offset 20000 limit 1`
  const deepCursor = Buffer.from(`${deep.ts}|${deep.id}`).toString('base64url')
  const [sample] = await sql`select id::text from gam.leads where status = 'won' and id % 2 = 0 limit 1`

  console.log('\n| Requête de l’application | Requêtes SQL | Temps médian (total) | Pages lues (requête la plus lourde) | Accès utilisés |')
  console.log('|---|---:|---:|---:|---|')
  await explainLast('Liste des demandes, 1re page', () => listLeads(sql as never, {}, null))
  await explainLast('Liste filtrée « Nouvelles »', () => listLeads(sql as never, { status: 'new' }, null))
  await explainLast('Page profonde (après 20 000 demandes) — curseur', () => listLeads(sql as never, {}, deepCursor))
  await explainLast('Recherche « dubois léa » (sans accents)', () => listLeads(sql as never, { q: 'dubois lea' }, null))
  await explainLast('Recherche par téléphone partiel', () => listLeads(sql as never, { q: '0012345' }, null))
  await explainLast('Filtre prestation + période', () =>
    listLeads(sql as never, { serviceId: 2, from: '2025-01-01', to: '2025-03-31' }, null)
  )
  await explainLast('Badge « nouvelles demandes » (chaque page du back-office)', () => countNewLeads(sql as never))
  await explainLast('Compteurs par statut (onglets de la liste)', () => countByStatus(sql as never))
  await explainLast('Indicateurs du tableau de bord', () => dashboardStats(sql as never))
  await explainLast('Fiche d’une demande + historique', () => getLead(sql as never, sample.id))
  await explainLast('Notifications à renvoyer (tâche nocturne)', () => pendingNotifications(sql as never))
  await explainLast('Journal, 1re page', () => listAudit(sql as never, null))
  await explainLast('Habillage du site (coordonnées, prestations)', () => fetchSiteChrome(sql as never))
  await explainLast('Page d’une prestation', () => fetchServiceBySlug(sql as never, 'vitres-et-facades'))

  // Comparaison avec une pagination par OFFSET classique à la même profondeur.
  const offsetPlan = await sql.unsafe(
    `explain (analyze, format json) select id from gam.leads order by created_at desc, id desc offset 20000 limit 26`
  )
  console.log(
    `\nÀ titre de comparaison, OFFSET 20 000 : ${(offsetPlan[0]['QUERY PLAN'] as { 'Execution Time': number }[])[0]['Execution Time'].toFixed(2)} ms (parcourt les 20 000 lignes sautées).`
  )
} finally {
  await sql.end()
}
