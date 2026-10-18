// ============================================================================
// Contenu initial de la base (npm run db:seed), repris de defaults.ts.
// ----------------------------------------------------------------------------
// Idempotent et non destructif : seules les données ABSENTES sont créées.
// Une modification faite depuis le back-office n'est jamais écrasée, et
// relancer le script ne crée pas de doublon.
// ============================================================================
import type { Sql, Tx } from './client'
import {
  defaultClaims,
  defaultFaq,
  defaultSectors,
  defaultServices,
  defaultSettings,
} from '../modules/content/defaults'

export type SeedReport = {
  settings: number
  claims: number
  services: number
  relations: number
  faq: number
  sectors: number
}

async function seedSettings(tx: Tx) {
  const s = defaultSettings
  const rows = await tx`
    insert into gam.site_settings (
      company_name, legal_name, legal_form, share_capital, siret, vat_number, registration, ape_code,
      publication_director, founded_year, phone_display, phone_e164, email, street, postal_code, city,
      department, department_code, region, service_area_short, service_area_long, service_areas,
      opening_hours, response_time, linkedin_url, linkedin_confirmed, host_name, host_address, host_website,
      lead_retention_months
    ) values (
      ${s.companyName}, ${s.legalName}, ${s.legalForm}, ${s.shareCapital}, ${s.siret}, ${s.vatNumber},
      ${s.registration}, ${s.apeCode}, ${s.publicationDirector}, ${s.foundedYear}, ${s.phone.display},
      ${s.phone.e164}, ${s.email}, ${s.address.street}, ${s.address.postalCode}, ${s.address.city},
      ${s.address.department}, ${s.address.departmentCode}, ${s.address.region}, ${s.serviceArea.short},
      ${s.serviceArea.long}, ${s.serviceArea.areas}, ${s.openingHours ? tx.json(s.openingHours) : null},
      ${s.responseTime}, ${s.linkedin.url}, ${s.linkedin.confirmed}, ${s.host.name}, ${s.host.address},
      ${s.host.website}, ${s.leadRetentionMonths}
    )
    on conflict (id) do nothing
    returning id`
  return rows.length
}

async function seedClaims(tx: Tx) {
  const rows = defaultClaims.map((c) => ({
    key: c.key,
    title: c.title,
    body: c.body,
    is_confirmed: c.confirmed,
    position: c.position,
  }))
  return (await tx`insert into gam.claims ${tx(rows)} on conflict (key) do nothing returning key`).length
}

/** Insère les prestations manquantes ; renvoie l'identifiant de chaque slug (créé ou existant). */
async function seedServices(tx: Tx) {
  const created = new Set<string>()
  for (const s of defaultServices) {
    const rows = await tx<{ id: number }[]>`
      insert into gam.services (
        slug, name, summary, icon, is_featured, is_published, position, h1, meta_title, meta_description,
        image_key, image_alt, photo_brief, intro, includes, for_whom, how_it_works, groups
      ) values (
        ${s.slug}, ${s.name}, ${s.summary}, ${s.icon}, ${s.featured}, ${s.published}, ${s.position}, ${s.h1},
        ${s.metaTitle}, ${s.metaDescription}, ${s.imageKey}, ${s.imageAlt}, ${s.photoBrief}, ${s.intro},
        ${s.includes}, ${s.forWhom}, ${tx.json(s.howItWorks)}, ${tx.json(s.groups)}
      )
      on conflict (slug) do nothing
      returning id`
    if (rows.length > 0) created.add(s.slug)
  }
  const ids = new Map(
    (await tx<{ id: number; slug: string }[]>`select id, slug from gam.services`).map((r) => [r.slug, r.id])
  )
  return { created, ids }
}

export async function seed(sql: Sql): Promise<SeedReport> {
  return sql.begin(async (tx) => {
    const settings = await seedSettings(tx)
    const claims = await seedClaims(tx)
    const { created, ids } = await seedServices(tx)

    // Liens et FAQ : uniquement pour les prestations créées par cette exécution.
    let relations = 0
    let faq = 0
    for (const s of defaultServices) {
      if (!created.has(s.slug)) continue
      const serviceId = ids.get(s.slug)!
      const related = s.related
        .map((slug) => ids.get(slug))
        .filter((id): id is number => id !== undefined && id !== serviceId)
        .map((related_id, position) => ({ service_id: serviceId, related_id, position }))
      if (related.length > 0) {
        relations += (await tx`insert into gam.service_relations ${tx(related)} on conflict do nothing returning 1`).length
      }
      if (s.faq.length > 0) {
        const rows = s.faq.map((f, position) => ({ service_id: serviceId, question: f.question, answer: f.answer, position }))
        faq += (await tx`insert into gam.faq_items ${tx(rows)} returning id`).length
      }
    }

    // FAQ générale : seulement si elle n'existe pas encore (les questions n'ont pas de clé naturelle).
    const [{ n: generalCount }] = await tx<{ n: number }[]>`
      select count(*)::int as n from gam.faq_items where service_id is null`
    if (generalCount === 0 && defaultFaq.length > 0) {
      const rows = defaultFaq.map((f, position) => ({ question: f.question, answer: f.answer, position }))
      faq += (await tx`insert into gam.faq_items ${tx(rows)} returning id`).length
    }

    let sectors = 0
    for (const s of defaultSectors) {
      const rows = await tx<{ id: number }[]>`
        insert into gam.sectors (slug, name, icon, challenge, approach, examples, position)
        values (${s.slug}, ${s.name}, ${s.icon}, ${s.challenge}, ${s.approach}, ${s.examples}, ${s.position})
        on conflict (slug) do nothing
        returning id`
      if (rows.length === 0) continue
      sectors += 1
      const links = s.services
        .map((slug) => ids.get(slug))
        .filter((id): id is number => id !== undefined)
        .map((service_id, position) => ({ sector_id: rows[0].id, service_id, position }))
      if (links.length > 0) await tx`insert into gam.sector_services ${tx(links)} on conflict do nothing`
    }

    return { settings, claims, services: created.size, relations, faq, sectors }
  }) as Promise<SeedReport>
}
