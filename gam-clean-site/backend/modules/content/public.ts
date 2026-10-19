// ============================================================================
// Contenus publics — lectures mises en cache (Next.js « use cache »).
// ----------------------------------------------------------------------------
// - Les pages restent statiques : la base n'est interrogée qu'à la génération
//   ou après une modification (updateTag depuis le back-office), puis au plus
//   une fois par jour en arrière-plan.
// - Si la base n'est pas configurée ou ne répond pas, le site s'affiche avec
//   le contenu par défaut (et réessaie quelques minutes plus tard).
// ============================================================================
import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { getSql } from '../../db/client'
import type { FaqItem, PublishedReview, Sector, Service, ServiceSummary, SiteChrome } from '@/shared/types/content'
import { defaultClaims, defaultFaq, defaultSectors, defaultServices, defaultSettings, type DefaultService } from './defaults'
import {
  fetchGeneralFaq,
  fetchPublishedReviews,
  fetchPublishedSlugs,
  fetchSectors,
  fetchServiceBySlug,
  fetchSiteChrome,
} from './repository'
import { CONTENT_TAG, REVIEWS_TAG } from './tags'

// ---------------------------------------------------------------------------
// Contenu de repli (identique au contenu initial de la base)
// ---------------------------------------------------------------------------
const published = defaultServices.filter((s) => s.published)
const fallbackSummary = (s: DefaultService): ServiceSummary => ({
  id: defaultServices.indexOf(s) + 1,
  slug: s.slug,
  name: s.name,
  summary: s.summary,
  icon: s.icon,
  featured: s.featured,
  imageKey: s.imageKey,
})

const fallbackChrome = (): SiteChrome => ({
  settings: defaultSettings,
  claims: defaultClaims,
  services: published.map(fallbackSummary),
})

function fallbackService(slug: string): Service | null {
  const s = published.find((x) => x.slug === slug)
  if (!s) return null
  return {
    ...fallbackSummary(s),
    h1: s.h1,
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    imageAlt: s.imageAlt,
    photoBrief: s.photoBrief,
    intro: s.intro,
    includes: s.includes,
    forWhom: s.forWhom,
    howItWorks: s.howItWorks,
    groups: s.groups,
    faq: s.faq.map((f, i) => ({ id: i + 1, ...f })),
    related: s.related
      .map((r) => published.find((x) => x.slug === r))
      .filter((x): x is DefaultService => Boolean(x))
      .map(fallbackSummary),
  }
}

const fallbackSectors = (): Sector[] =>
  defaultSectors.map((s, i) => ({
    id: i + 1,
    slug: s.slug,
    name: s.name,
    icon: s.icon,
    challenge: s.challenge,
    approach: s.approach,
    examples: s.examples,
    services: s.services
      .map((slug) => published.find((x) => x.slug === slug))
      .filter((x): x is DefaultService => Boolean(x))
      .map((x) => ({ slug: x.slug, name: x.name })),
  }))

/** Exécute une lecture en base ; en cas d'absence ou d'erreur, renvoie le repli. */
async function readOr<T>(label: string, read: (sql: NonNullable<ReturnType<typeof getSql>>) => Promise<T | null>, fallback: () => T) {
  const sql = getSql()
  if (!sql) return { value: fallback(), fresh: true }
  try {
    const value = await read(sql)
    return value === null ? { value: fallback(), fresh: false } : { value, fresh: true }
  } catch (error) {
    console.error(`[contenu] Lecture « ${label} » impossible, contenu par défaut utilisé.`, error)
    return { value: fallback(), fresh: false }
  }
}

// ---------------------------------------------------------------------------
// Lectures publiques
// ---------------------------------------------------------------------------
export async function getSiteChrome(): Promise<SiteChrome> {
  'use cache'
  cacheTag(CONTENT_TAG)
  const { value, fresh } = await readOr('habillage', fetchSiteChrome, fallbackChrome)
  if (fresh) cacheLife('days')
  else cacheLife('minutes')
  return value
}

export async function getService(slug: string): Promise<Service | null> {
  'use cache'
  cacheTag(CONTENT_TAG)
  const sql = getSql()
  if (!sql) {
    cacheLife('days')
    return fallbackService(slug)
  }
  try {
    const service = await fetchServiceBySlug(sql, slug)
    cacheLife('days')
    return service
  } catch (error) {
    console.error(`[contenu] Prestation « ${slug} » illisible, contenu par défaut utilisé.`, error)
    cacheLife('minutes')
    return fallbackService(slug)
  }
}

export async function getPublishedServiceSlugs(): Promise<string[]> {
  'use cache'
  cacheTag(CONTENT_TAG)
  const { value, fresh } = await readOr('adresses des prestations', fetchPublishedSlugs, () => published.map((s) => s.slug))
  if (fresh) cacheLife('days')
  else cacheLife('minutes')
  return value.length > 0 ? value : published.map((s) => s.slug)
}

export async function getGeneralFaq(): Promise<FaqItem[]> {
  'use cache'
  cacheTag(CONTENT_TAG)
  const { value, fresh } = await readOr('FAQ', fetchGeneralFaq, () => defaultFaq.map((f, i) => ({ id: i + 1, ...f })))
  if (fresh) cacheLife('days')
  else cacheLife('minutes')
  return value
}

export async function getSectors(): Promise<Sector[]> {
  'use cache'
  cacheTag(CONTENT_TAG)
  const { value, fresh } = await readOr('secteurs', fetchSectors, fallbackSectors)
  if (fresh) cacheLife('days')
  else cacheLife('minutes')
  return value
}

export async function getPublishedReviews(limit = 6): Promise<PublishedReview[]> {
  'use cache'
  cacheTag(REVIEWS_TAG)
  const { value, fresh } = await readOr('avis publiés', (sql) => fetchPublishedReviews(sql, limit), () => [])
  if (fresh) cacheLife('hours')
  else cacheLife('minutes')
  return value
}

/** Année courante pour le pied de page (mise en cache : pas d'horloge pendant le rendu statique). */
export async function getCurrentYear(): Promise<number> {
  'use cache'
  cacheLife('days')
  return new Date().getFullYear()
}
