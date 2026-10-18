// ============================================================================
// Types des contenus du site (produits par le backend, affichés par le frontend).
// ============================================================================
import type { IconName } from '../constants'

export type SiteSettings = {
  companyName: string
  legalName: string
  legalForm: string | null
  shareCapital: string | null
  siret: string
  vatNumber: string | null
  registration: string | null
  apeCode: string | null
  publicationDirector: string | null
  foundedYear: number | null
  phone: { display: string; e164: string; href: string }
  email: string
  address: {
    street: string | null
    postalCode: string
    city: string
    department: string
    departmentCode: string
    region: string
    country: 'FR'
  }
  serviceArea: { short: string; long: string; areas: string[] }
  openingHours: { days: string; hours: string }[] | null
  responseTime: string | null
  linkedin: { url: string | null; confirmed: boolean }
  host: { name: string; address: string | null; website: string | null }
  leadRetentionMonths: number
}

export type Claim = {
  key: string
  title: string
  body: string
  confirmed: boolean
  position: number
}

export type HowItWorksStep = { title: string; text: string }

export type ServiceGroup = { id: string; title: string; icon: IconName; points: string[] }

export type ServiceSummary = {
  id: number
  slug: string
  name: string
  summary: string
  icon: IconName
  featured: boolean
  imageKey: string | null
}

export type FaqItem = {
  id: number
  question: string
  answer: string
}

export type Service = ServiceSummary & {
  h1: string
  metaTitle: string
  metaDescription: string
  imageAlt: string | null
  photoBrief: string | null
  intro: string[]
  includes: string[]
  forWhom: string[]
  howItWorks: HowItWorksStep[]
  groups: ServiceGroup[]
  faq: FaqItem[]
  related: ServiceSummary[]
}

export type Sector = {
  id: number
  slug: string
  name: string
  icon: IconName
  challenge: string
  approach: string
  examples: string[]
  services: Pick<ServiceSummary, 'slug' | 'name'>[]
}

export type PublishedReview = {
  id: string
  rating: number
  comment: string
  authorName: string
  authorCompany: string | null
  serviceName: string | null
  publishedAt: string
}

/** Données communes à toutes les pages publiques (en-tête, pied de page, CTA). */
export type SiteChrome = {
  settings: SiteSettings
  claims: Claim[]
  services: ServiceSummary[]
}
