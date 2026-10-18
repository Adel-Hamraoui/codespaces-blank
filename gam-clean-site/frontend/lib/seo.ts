// ============================================================================
// Métadonnées et données structurées (JSON-LD).
// Ne publie que des informations confirmées, transmises par le backend.
// ============================================================================
import type { Metadata } from 'next'
import { absoluteUrl, getSiteUrl } from '@/shared/config/site-url'
import type { SiteSettings } from '@/shared/types/content'

type PageMetaInput = {
  title: string
  description: string
  path: string
  /** Nom du site (paramètres de l'entreprise). */
  siteName: string
  /** true pour les pages à ne pas indexer (page de remerciement…). */
  noindex?: boolean
  /** Titre complet, sans le suffixe « | Nom du site ». */
  absoluteTitle?: boolean
}

export function pageMetadata({ title, description, path, siteName, noindex, absoluteTitle }: PageMetaInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${siteName}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', locale: 'fr_FR', siteName, url: path, title: fullTitle, description },
    twitter: { card: 'summary_large_image', title: fullTitle, description },
    robots: noindex ? { index: false, follow: true } : undefined,
  }
}

const areaServed = (s: SiteSettings) => s.serviceArea.areas.map((name) => ({ '@type': 'AdministrativeArea', name }))

export function localBusinessJsonLd(s: SiteSettings, description: string) {
  const url = getSiteUrl()
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}/#entreprise`,
    name: s.companyName,
    legalName: s.legalName,
    description,
    url,
    logo: `${url}/brand/icon-512.png`,
    image: `${url}/opengraph-image.jpg`,
    telephone: s.phone.e164,
    email: s.email,
    identifier: { '@type': 'PropertyValue', propertyID: 'SIRET', value: s.siret },
    address: {
      '@type': 'PostalAddress',
      ...(s.address.street ? { streetAddress: s.address.street } : {}),
      postalCode: s.address.postalCode,
      addressLocality: s.address.city,
      addressRegion: s.address.region,
      addressCountry: s.address.country,
    },
    areaServed: areaServed(s),
  }
  if (s.vatNumber) data.vatID = s.vatNumber
  if (s.foundedYear) data.foundingDate = String(s.foundedYear)
  if (s.linkedin.confirmed && s.linkedin.url) data.sameAs = [s.linkedin.url]
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

export function serviceJsonLd(service: { name: string; description: string; path: string }, s: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: absoluteUrl(service.path),
    provider: { '@id': `${getSiteUrl()}/#entreprise` },
    areaServed: areaServed(s),
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
