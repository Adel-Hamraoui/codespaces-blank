import type { Metadata } from 'next'
import { company } from '@/content/site'

/**
 * URL publique du site, sans slash final.
 * Priorité : NEXT_PUBLIC_SITE_URL > domaine de production Vercel > localhost.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProd) return `https://${vercelProd}`
  return 'http://localhost:3000'
}

/** Seul le déploiement de production est indexable (les previews Vercel ne le sont pas). */
export function isIndexable(): boolean {
  const env = process.env.VERCEL_ENV
  return env === undefined || env === 'production'
}

export const absoluteUrl = (path: string) => `${getSiteUrl()}${path === '/' ? '' : path}`

type PageMetaInput = {
  title: string
  description: string
  path: string
  /** true pour les pages à ne pas indexer (page de remerciement…). */
  noindex?: boolean
  /** Titre complet, sans le suffixe « | GAM CLEAN ». */
  absoluteTitle?: boolean
}

export function pageMetadata({ title, description, path, noindex, absoluteTitle }: PageMetaInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName: company.name,
      url: path,
      title: absoluteTitle ? title : `${title} | ${company.name}`,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: absoluteTitle ? title : `${title} | ${company.name}`,
      description,
    },
    robots: noindex ? { index: false, follow: true } : undefined,
  }
}

// ---------------------------------------------------------------------------
// Données structurées (JSON-LD) — uniquement des informations confirmées.
// ---------------------------------------------------------------------------
export function localBusinessJsonLd() {
  const url = getSiteUrl()
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}/#entreprise`,
    name: company.name,
    legalName: company.legalName,
    description:
      'Entreprise de nettoyage professionnel basée à Bondy (93) : bureaux, commerces, sites industriels, vitres et façades, fin de chantier et remise en état en Île-de-France.',
    url,
    logo: `${url}/brand/icon-512.png`,
    image: `${url}/opengraph-image.jpg`,
    telephone: company.phone.international,
    email: company.email,
    vatID: company.vatNumber,
    identifier: { '@type': 'PropertyValue', propertyID: 'SIRET', value: company.siret },
    address: {
      '@type': 'PostalAddress',
      ...(company.address.street ? { streetAddress: company.address.street } : {}),
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressRegion: company.address.region,
      addressCountry: company.address.country,
    },
    areaServed: company.serviceArea.areas.map((name) => ({ '@type': 'AdministrativeArea', name })),
  }
  if (company.foundedYear) data.foundingDate = String(company.foundedYear)
  if (company.social.linkedin.confirmed) data.sameAs = [company.social.linkedin.url]
  return data
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function serviceJsonLd(service: { name: string; description: string; path: string }) {
  const url = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: absoluteUrl(service.path),
    provider: { '@id': `${url}/#entreprise` },
    areaServed: company.serviceArea.areas.map((name) => ({ '@type': 'AdministrativeArea', name })),
  }
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  }
}
