// ============================================================================
// Contenus — accès aux données (SQL uniquement, sans logique de cache).
// Les lectures publiques regroupent tout ce qu'une page affiche en UNE requête
// (sous-requêtes jsonb_agg) : un seul aller-retour réseau vers Supabase.
// ============================================================================
import 'server-only'
import type { Sql, Tx } from '../../db/client'
import type { IconName } from '@/shared/constants'
import type {
  Claim,
  FaqItem,
  HowItWorksStep,
  PublishedReview,
  Sector,
  Service,
  ServiceGroup,
  ServiceSummary,
  SiteChrome,
  SiteSettings,
} from '@/shared/types/content'
import type { ServiceInput, SettingsInput } from '@/shared/validation/content'
import { formatPhone } from '@/shared/validation/common'

// ---------------------------------------------------------------------------
// Correspondance lignes SQL → types partagés
// ---------------------------------------------------------------------------
type SettingsRow = {
  company_name: string
  legal_name: string
  legal_form: string | null
  share_capital: string | null
  siret: string
  vat_number: string | null
  registration: string | null
  ape_code: string | null
  publication_director: string | null
  founded_year: number | null
  phone_display: string
  phone_e164: string
  email: string
  street: string | null
  postal_code: string
  city: string
  department: string
  department_code: string
  region: string
  service_area_short: string
  service_area_long: string
  service_areas: string[]
  opening_hours: { days: string; hours: string }[] | null
  response_time: string | null
  linkedin_url: string | null
  linkedin_confirmed: boolean
  host_name: string
  host_address: string | null
  host_website: string | null
  lead_retention_months: number
}

export function toSettings(r: SettingsRow): SiteSettings {
  return {
    companyName: r.company_name,
    legalName: r.legal_name,
    legalForm: r.legal_form,
    shareCapital: r.share_capital,
    siret: r.siret,
    vatNumber: r.vat_number,
    registration: r.registration,
    apeCode: r.ape_code,
    publicationDirector: r.publication_director,
    foundedYear: r.founded_year,
    phone: { display: r.phone_display || formatPhone(r.phone_e164), e164: r.phone_e164, href: `tel:${r.phone_e164}` },
    email: r.email,
    address: {
      street: r.street,
      postalCode: r.postal_code,
      city: r.city,
      department: r.department,
      departmentCode: r.department_code,
      region: r.region,
      country: 'FR',
    },
    serviceArea: { short: r.service_area_short, long: r.service_area_long, areas: r.service_areas },
    openingHours: r.opening_hours,
    responseTime: r.response_time,
    linkedin: { url: r.linkedin_url, confirmed: r.linkedin_confirmed },
    host: { name: r.host_name, address: r.host_address, website: r.host_website },
    leadRetentionMonths: r.lead_retention_months,
  }
}

const SUMMARY_JSON = (alias: string) => `jsonb_build_object(
  'id', ${alias}.id, 'slug', ${alias}.slug, 'name', ${alias}.name, 'summary', ${alias}.summary,
  'icon', ${alias}.icon, 'featured', ${alias}.is_featured, 'imageKey', ${alias}.image_key)`

// ---------------------------------------------------------------------------
// Lectures publiques
// ---------------------------------------------------------------------------
/** Paramètres + affirmations + prestations publiées : tout l'habillage du site, en une requête. */
export async function fetchSiteChrome(sql: Sql): Promise<SiteChrome | null> {
  const [row] = await sql<{ settings: SettingsRow | null; claims: Claim[]; services: ServiceSummary[] }[]>`
    select
      (select to_jsonb(s) from gam.site_settings s where s.id) as settings,
      (select coalesce(jsonb_agg(jsonb_build_object(
          'key', c.key, 'title', c.title, 'body', c.body, 'confirmed', c.is_confirmed, 'position', c.position)
          order by c.position, c.key), '[]'::jsonb)
         from gam.claims c) as claims,
      (select coalesce(jsonb_agg(${sql.unsafe(SUMMARY_JSON('v'))} order by v.position, v.id), '[]'::jsonb)
         from gam.services v where v.is_published) as services`
  if (!row?.settings) return null
  return { settings: toSettings(row.settings), claims: row.claims, services: row.services }
}

type ServiceRow = {
  id: number
  slug: string
  name: string
  summary: string
  icon: IconName
  is_featured: boolean
  image_key: string | null
  h1: string
  meta_title: string
  meta_description: string
  image_alt: string | null
  photo_brief: string | null
  intro: string[]
  includes: string[]
  for_whom: string[]
  how_it_works: HowItWorksStep[]
  groups: ServiceGroup[]
  faq: FaqItem[]
  related: ServiceSummary[]
}

const toService = (r: ServiceRow): Service => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  summary: r.summary,
  icon: r.icon,
  featured: r.is_featured,
  imageKey: r.image_key,
  h1: r.h1,
  metaTitle: r.meta_title,
  metaDescription: r.meta_description,
  imageAlt: r.image_alt,
  photoBrief: r.photo_brief,
  intro: r.intro,
  includes: r.includes,
  forWhom: r.for_whom,
  howItWorks: r.how_it_works,
  groups: r.groups,
  faq: r.faq,
  related: r.related,
})

/** Page de prestation complète (FAQ propre + prestations liées) en une requête. */
export async function fetchServiceBySlug(sql: Sql, slug: string): Promise<Service | null> {
  const [row] = await sql<ServiceRow[]>`
    select s.id, s.slug, s.name, s.summary, s.icon, s.is_featured, s.image_key, s.h1, s.meta_title,
           s.meta_description, s.image_alt, s.photo_brief, s.intro, s.includes, s.for_whom,
           s.how_it_works, s.groups,
           (select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'question', f.question, 'answer', f.answer)
                    order by f.position, f.id), '[]'::jsonb)
              from gam.faq_items f where f.service_id = s.id and f.is_published) as faq,
           (select coalesce(jsonb_agg(${sql.unsafe(SUMMARY_JSON('rs'))} order by r.position, rs.position), '[]'::jsonb)
              from gam.service_relations r
              join gam.services rs on rs.id = r.related_id and rs.is_published
             where r.service_id = s.id) as related
    from gam.services s
    where s.slug = ${slug} and s.is_published`
  return row ? toService(row) : null
}

export async function fetchPublishedSlugs(sql: Sql): Promise<string[]> {
  const rows = await sql<{ slug: string }[]>`select slug from gam.services where is_published order by position, id`
  return rows.map((r) => r.slug)
}

export async function fetchGeneralFaq(sql: Sql): Promise<FaqItem[]> {
  return sql<FaqItem[]>`
    select id, question, answer from gam.faq_items
    where service_id is null and is_published
    order by position, id`
}

export async function fetchSectors(sql: Sql): Promise<Sector[]> {
  return sql<Sector[]>`
    select s.id, s.slug, s.name, s.icon, s.challenge, s.approach, s.examples,
           (select coalesce(jsonb_agg(jsonb_build_object('slug', v.slug, 'name', v.name) order by ss.position, v.position), '[]'::jsonb)
              from gam.sector_services ss join gam.services v on v.id = ss.service_id and v.is_published
             where ss.sector_id = s.id) as services
    from gam.sectors s
    where s.is_published
    order by s.position, s.id`
}

export async function fetchPublishedReviews(sql: Sql, limit: number): Promise<PublishedReview[]> {
  return sql<PublishedReview[]>`
    select r.id::text as id, r.rating, r.comment, r.author_name as "authorName",
           r.author_company as "authorCompany", v.name as "serviceName",
           to_char(r.moderated_at, 'YYYY-MM-DD') as "publishedAt"
    from gam.reviews r
    left join gam.services v on v.id = r.service_id
    where r.status = 'published'
    order by r.moderated_at desc, r.id desc
    limit ${limit}`
}

// ---------------------------------------------------------------------------
// Back-office : lectures
// ---------------------------------------------------------------------------
export async function fetchSettingsRow(sql: Sql): Promise<SiteSettings | null> {
  const [row] = await sql<SettingsRow[]>`select * from gam.site_settings where id`
  return row ? toSettings(row) : null
}

export type AdminServiceRow = {
  id: number
  slug: string
  name: string
  icon: IconName
  position: number
  is_featured: boolean
  is_published: boolean
  updated_at: string
  faq_count: number
  lead_count: number
}

export async function listServicesAdmin(sql: Sql): Promise<AdminServiceRow[]> {
  return sql<AdminServiceRow[]>`
    select s.id, s.slug, s.name, s.icon, s.position, s.is_featured, s.is_published, s.updated_at,
           (select count(*)::int from gam.faq_items f where f.service_id = s.id) as faq_count,
           (select count(*)::int from gam.lead_services ls where ls.service_id = s.id) as lead_count
    from gam.services s
    order by s.position, s.id`
}

export type ServiceEdit = ServiceInput & { id: number }

export async function fetchServiceForEdit(sql: Sql, id: number): Promise<ServiceEdit | null> {
  const [r] = await sql`
    select s.*, coalesce(array_agg(r.related_id order by r.position) filter (where r.related_id is not null), '{}') as related_ids
    from gam.services s
    left join gam.service_relations r on r.service_id = s.id
    where s.id = ${id}
    group by s.id`
  if (!r) return null
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    summary: r.summary,
    icon: r.icon,
    featured: r.is_featured,
    published: r.is_published,
    position: r.position,
    h1: r.h1,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    imageKey: r.image_key,
    imageAlt: r.image_alt,
    photoBrief: r.photo_brief,
    intro: r.intro,
    includes: r.includes,
    forWhom: r.for_whom,
    howItWorks: r.how_it_works,
    groups: r.groups,
    relatedIds: r.related_ids,
  }
}

export type AdminFaqRow = {
  id: number
  question: string
  answer: string
  position: number
  is_published: boolean
  service_id: number | null
  service_name: string | null
}

export async function listFaqAdmin(sql: Sql): Promise<AdminFaqRow[]> {
  return sql<AdminFaqRow[]>`
    select f.id, f.question, f.answer, f.position, f.is_published, f.service_id, s.name as service_name
    from gam.faq_items f
    left join gam.services s on s.id = f.service_id
    order by f.service_id nulls first, f.position, f.id`
}

export type AdminSectorRow = Sector & { position: number; is_published: boolean; serviceIds: number[] }

export async function listSectorsAdmin(sql: Sql): Promise<AdminSectorRow[]> {
  return sql<AdminSectorRow[]>`
    select s.id, s.slug, s.name, s.icon, s.challenge, s.approach, s.examples, s.position, s.is_published,
           coalesce(array_agg(ss.service_id order by ss.position) filter (where ss.service_id is not null), '{}') as "serviceIds",
           '[]'::jsonb as services
    from gam.sectors s
    left join gam.sector_services ss on ss.sector_id = s.id
    group by s.id
    order by s.position, s.id`
}

export async function listClaimsAdmin(sql: Sql): Promise<(Claim & { updatedAt: string })[]> {
  return sql`
    select key, title, body, is_confirmed as confirmed, position, updated_at as "updatedAt"
    from gam.claims order by position, key`
}

// ---------------------------------------------------------------------------
// Back-office : écritures (dans une transaction avec acteur, voir withActor)
// ---------------------------------------------------------------------------
export async function updateSettings(tx: Tx, d: SettingsInput, actorId: number) {
  await tx`
    update gam.site_settings set
      company_name = ${d.companyName}, legal_name = ${d.legalName}, legal_form = ${d.legalForm},
      share_capital = ${d.shareCapital}, siret = ${d.siret}, vat_number = ${d.vatNumber},
      registration = ${d.registration}, ape_code = ${d.apeCode}, publication_director = ${d.publicationDirector},
      founded_year = ${d.foundedYear}, phone_display = ${d.phoneDisplay}, phone_e164 = ${d.phoneE164},
      email = ${d.email}, street = ${d.street}, postal_code = ${d.postalCode}, city = ${d.city},
      department = ${d.department}, department_code = ${d.departmentCode}, region = ${d.region},
      service_area_short = ${d.serviceAreaShort}, service_area_long = ${d.serviceAreaLong},
      service_areas = ${d.serviceAreas}, opening_hours = ${d.openingHours ? tx.json(d.openingHours) : null},
      response_time = ${d.responseTime}, linkedin_url = ${d.linkedinUrl}, linkedin_confirmed = ${d.linkedinConfirmed},
      host_name = ${d.hostName}, host_address = ${d.hostAddress}, host_website = ${d.hostWebsite},
      lead_retention_months = ${d.leadRetentionMonths}, updated_by = ${actorId}
    where id`
}

export async function updateClaim(tx: Tx, d: { key: string; title: string; body: string; confirmed: boolean }, actorId: number) {
  const rows = await tx`
    update gam.claims set title = ${d.title}, body = ${d.body}, is_confirmed = ${d.confirmed}, updated_by = ${actorId}
    where key = ${d.key} returning key`
  return rows.length > 0
}

function serviceColumns(d: ServiceInput, actorId: number) {
  return {
    slug: d.slug,
    name: d.name,
    summary: d.summary,
    icon: d.icon,
    is_featured: d.featured,
    is_published: d.published,
    position: d.position,
    h1: d.h1,
    meta_title: d.metaTitle,
    meta_description: d.metaDescription,
    image_key: d.imageKey,
    image_alt: d.imageAlt,
    photo_brief: d.photoBrief,
    intro: d.intro,
    includes: d.includes,
    for_whom: d.forWhom,
    how_it_works: d.howItWorks as unknown as string,
    groups: d.groups as unknown as string,
    updated_by: actorId,
  }
}

async function replaceRelations(tx: Tx, serviceId: number, relatedIds: number[]) {
  await tx`delete from gam.service_relations where service_id = ${serviceId}`
  const ids = relatedIds.filter((id) => id !== serviceId)
  if (ids.length === 0) return
  const rows = ids.map((related_id, position) => ({ service_id: serviceId, related_id, position }))
  await tx`insert into gam.service_relations ${tx(rows)} on conflict do nothing`
}

export async function insertService(tx: Tx, d: ServiceInput, actorId: number): Promise<number> {
  const cols = serviceColumns(d, actorId)
  const [row] = await tx<{ id: number }[]>`
    insert into gam.services ${tx({ ...cols, how_it_works: tx.json(d.howItWorks), groups: tx.json(d.groups) } as never)}
    returning id`
  await replaceRelations(tx, row.id, d.relatedIds)
  return row.id
}

export async function updateService(tx: Tx, id: number, d: ServiceInput, actorId: number): Promise<boolean> {
  const cols = serviceColumns(d, actorId)
  const rows = await tx`
    update gam.services set ${tx({ ...cols, how_it_works: tx.json(d.howItWorks), groups: tx.json(d.groups) } as never)}
    where id = ${id} returning id`
  if (rows.length === 0) return false
  await replaceRelations(tx, id, d.relatedIds)
  return true
}

export async function deleteService(tx: Tx, id: number) {
  return (await tx`delete from gam.services where id = ${id} returning slug`)[0]?.slug as string | undefined
}

export async function insertFaq(tx: Tx, d: { question: string; answer: string; serviceId: number | null; position: number; published: boolean }, actorId: number) {
  const [row] = await tx<{ id: number }[]>`
    insert into gam.faq_items (question, answer, service_id, position, is_published, updated_by)
    values (${d.question}, ${d.answer}, ${d.serviceId}, ${d.position}, ${d.published}, ${actorId})
    returning id`
  return row.id
}

export async function updateFaq(tx: Tx, id: number, d: { question: string; answer: string; serviceId: number | null; position: number; published: boolean }, actorId: number) {
  const rows = await tx`
    update gam.faq_items set question = ${d.question}, answer = ${d.answer}, service_id = ${d.serviceId},
      position = ${d.position}, is_published = ${d.published}, updated_by = ${actorId}
    where id = ${id} returning id`
  return rows.length > 0
}

export async function deleteFaq(tx: Tx, id: number) {
  return (await tx`delete from gam.faq_items where id = ${id} returning id`).length > 0
}

type SectorWrite = {
  slug: string
  name: string
  icon: IconName
  challenge: string
  approach: string
  examples: string[]
  position: number
  published: boolean
  serviceIds: number[]
}

async function replaceSectorServices(tx: Tx, sectorId: number, serviceIds: number[]) {
  await tx`delete from gam.sector_services where sector_id = ${sectorId}`
  if (serviceIds.length === 0) return
  const rows = [...new Set(serviceIds)].map((service_id, position) => ({ sector_id: sectorId, service_id, position }))
  await tx`insert into gam.sector_services ${tx(rows)}`
}

export async function insertSector(tx: Tx, d: SectorWrite, actorId: number) {
  const [row] = await tx<{ id: number }[]>`
    insert into gam.sectors (slug, name, icon, challenge, approach, examples, position, is_published, updated_by)
    values (${d.slug}, ${d.name}, ${d.icon}, ${d.challenge}, ${d.approach}, ${d.examples}, ${d.position}, ${d.published}, ${actorId})
    returning id`
  await replaceSectorServices(tx, row.id, d.serviceIds)
  return row.id
}

export async function updateSector(tx: Tx, id: number, d: SectorWrite, actorId: number) {
  const rows = await tx`
    update gam.sectors set slug = ${d.slug}, name = ${d.name}, icon = ${d.icon}, challenge = ${d.challenge},
      approach = ${d.approach}, examples = ${d.examples}, position = ${d.position}, is_published = ${d.published},
      updated_by = ${actorId}
    where id = ${id} returning id`
  if (rows.length === 0) return false
  await replaceSectorServices(tx, id, d.serviceIds)
  return true
}

export async function deleteSector(tx: Tx, id: number) {
  return (await tx`delete from gam.sectors where id = ${id} returning id`).length > 0
}
