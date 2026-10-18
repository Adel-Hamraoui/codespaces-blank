// ============================================================================
// Contenus éditables depuis le back-office — validation partagée.
// Les limites reprennent exactement les contraintes CHECK de la base, pour que
// l'utilisateur reçoive un message clair avant toute erreur SQL.
// ============================================================================
import { IMAGE_KEYS, SERVICE_ICONS, type IconName } from '../constants'
import type { HowItWorksStep, ServiceGroup } from '../types/content'
import { bool, formatPhone, isEmail, lines, normalizeEmail, optStr, parseIntIn, SLUG_RE, str, toE164, type FieldErrors } from './common'

const len = (v: string, min: number, max: number) => v.length >= min && v.length <= max
const isIcon = (v: unknown): v is IconName => typeof v === 'string' && (SERVICE_ICONS as readonly string[]).includes(v)

/** Transforme un titre en identifiant d'URL (« Vitres & façades » → « vitres-facades »). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ---------------------------------------------------------------------------
// Coordonnées et informations légales
// ---------------------------------------------------------------------------
export type SettingsInput = {
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
  phoneDisplay: string
  phoneE164: string
  email: string
  street: string | null
  postalCode: string
  city: string
  department: string
  departmentCode: string
  region: string
  serviceAreaShort: string
  serviceAreaLong: string
  serviceAreas: string[]
  openingHours: { days: string; hours: string }[] | null
  responseTime: string | null
  linkedinUrl: string | null
  linkedinConfirmed: boolean
  hostName: string
  hostAddress: string | null
  hostWebsite: string | null
  leadRetentionMonths: number
}

export function validateSettings(f: Record<string, unknown>) {
  const phone = str(f.phone, 30)
  const phoneE164 = toE164(phone)
  const year = parseIntIn(f.foundedYear, 1900, 2100)
  const retention = parseIntIn(f.leadRetentionMonths, 6, 120)
  const hours = lines(f.openingHours, 7, 80)
    .map((l) => {
      const [days, ...rest] = l.split(':')
      return { days: days.trim(), hours: rest.join(':').trim() }
    })
    .filter((h) => h.days && h.hours)

  const data: SettingsInput = {
    companyName: str(f.companyName, 80),
    legalName: str(f.legalName, 120),
    legalForm: optStr(f.legalForm, 60),
    shareCapital: optStr(f.shareCapital, 40),
    siret: str(f.siret, 20).replace(/\s/g, ''),
    vatNumber: optStr(str(f.vatNumber, 20).replace(/\s/g, '').toUpperCase(), 20),
    registration: optStr(f.registration, 120),
    apeCode: optStr(str(f.apeCode, 10).toUpperCase(), 10),
    publicationDirector: optStr(f.publicationDirector, 120),
    foundedYear: year === 'invalid' ? null : year,
    phoneDisplay: phoneE164 ? formatPhone(phoneE164) : phone,
    phoneE164: phoneE164 ?? '',
    email: normalizeEmail(f.email),
    street: optStr(f.street, 160),
    postalCode: str(f.postalCode, 5),
    city: str(f.city, 80),
    department: str(f.department, 80),
    departmentCode: str(f.departmentCode, 3).toUpperCase(),
    region: str(f.region, 80),
    serviceAreaShort: str(f.serviceAreaShort, 80),
    serviceAreaLong: str(f.serviceAreaLong, 300),
    serviceAreas: lines(f.serviceAreas, 20, 60),
    openingHours: hours.length ? hours : null,
    responseTime: optStr(f.responseTime, 80),
    linkedinUrl: optStr(f.linkedinUrl, 200),
    linkedinConfirmed: bool(f.linkedinConfirmed),
    hostName: str(f.hostName, 120),
    hostAddress: optStr(f.hostAddress, 200),
    hostWebsite: optStr(f.hostWebsite, 200),
    leadRetentionMonths: retention === 'invalid' || retention === null ? 36 : retention,
  }

  const e: FieldErrors<keyof SettingsInput | 'phone'> = {}
  if (!len(data.companyName, 2, 80)) e.companyName = 'Nom commercial requis (2 à 80 caractères).'
  if (!len(data.legalName, 2, 120)) e.legalName = 'Raison sociale requise.'
  if (!/^\d{14}$/.test(data.siret)) e.siret = 'Le SIRET comporte 14 chiffres.'
  if (data.vatNumber && !/^FR[0-9A-Z]{2}\d{9}$/.test(data.vatNumber)) e.vatNumber = 'Format attendu : FR + 2 caractères + 9 chiffres.'
  if (data.apeCode && !/^\d{2}\.\d{2}[A-Z]$/.test(data.apeCode)) e.apeCode = 'Format attendu : 81.21Z.'
  if (year === 'invalid') e.foundedYear = 'Année invalide.'
  if (!data.phoneE164) e.phone = 'Numéro invalide (exemple : 07 51 37 94 55).'
  if (!isEmail(data.email)) e.email = 'Adresse e-mail invalide.'
  if (!/^\d{5}$/.test(data.postalCode)) e.postalCode = 'Code postal à 5 chiffres.'
  if (!len(data.city, 2, 80)) e.city = 'Ville requise.'
  if (!len(data.department, 2, 80)) e.department = 'Département requis.'
  if (!/^(2A|2B|\d{2,3})$/.test(data.departmentCode)) e.departmentCode = 'Numéro de département invalide.'
  if (!len(data.region, 2, 80)) e.region = 'Région requise.'
  if (!len(data.serviceAreaShort, 2, 80)) e.serviceAreaShort = 'Zone (version courte) requise.'
  if (!len(data.serviceAreaLong, 10, 300)) e.serviceAreaLong = 'Zone (phrase complète) : 10 à 300 caractères.'
  if (data.linkedinUrl && !/^https:\/\/([a-z]+\.)?linkedin\.com\//.test(data.linkedinUrl)) e.linkedinUrl = 'Adresse LinkedIn complète attendue (https://www.linkedin.com/…).'
  if (!len(data.hostName, 2, 120)) e.hostName = 'Nom de l’hébergeur requis.'
  if (data.hostWebsite && !/^https:\/\//.test(data.hostWebsite)) e.hostWebsite = 'Adresse commençant par https:// attendue.'
  if (retention === 'invalid') e.leadRetentionMonths = 'Entre 6 et 120 mois.'
  return { data, errors: e }
}

// ---------------------------------------------------------------------------
// Affirmations commerciales
// ---------------------------------------------------------------------------
export function validateClaim(f: Record<string, unknown>) {
  const data = { key: str(f.key, 40), title: str(f.title, 80), body: str(f.body, 300), confirmed: bool(f.confirmed) }
  const e: FieldErrors<'key' | 'title' | 'body'> = {}
  if (!/^[a-z][a-zA-Z0-9]{1,39}$/.test(data.key)) e.key = 'Clé invalide.'
  if (!len(data.title, 3, 80)) e.title = 'Titre : 3 à 80 caractères.'
  if (!len(data.body, 5, 300)) e.body = 'Texte : 5 à 300 caractères.'
  return { data, errors: e }
}

// ---------------------------------------------------------------------------
// Prestations
// ---------------------------------------------------------------------------
export type ServiceInput = {
  slug: string
  name: string
  summary: string
  icon: IconName
  featured: boolean
  published: boolean
  position: number
  h1: string
  metaTitle: string
  metaDescription: string
  imageKey: string | null
  imageAlt: string | null
  photoBrief: string | null
  intro: string[]
  includes: string[]
  forWhom: string[]
  howItWorks: HowItWorksStep[]
  groups: ServiceGroup[]
  relatedIds: number[]
}

/** Lignes « Titre :: texte » → étapes. */
export function parseSteps(v: unknown, max = 6): HowItWorksStep[] {
  return lines(v, max, 400)
    .map((l) => {
      const [title, ...rest] = l.split('::')
      return { title: title.trim().slice(0, 80), text: rest.join('::').trim().slice(0, 300) }
    })
    .filter((s) => s.title && s.text)
}

export const formatSteps = (steps: HowItWorksStep[]) => steps.map((s) => `${s.title} :: ${s.text}`).join('\n')

/**
 * Groupes de la page « Prestations spécialisées » saisis en texte :
 *   ## Titre du groupe | icône
 *   - point
 *   - point
 */
export function parseGroups(v: unknown): ServiceGroup[] {
  const text = typeof v === 'string' ? v : ''
  const groups: ServiceGroup[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (line.startsWith('##')) {
      const [title, icon] = line.slice(2).split('|').map((s) => s.trim())
      if (title) groups.push({ id: slugify(title), title: title.slice(0, 80), icon: isIcon(icon) ? icon : 'layers', points: [] })
    } else if (line.startsWith('-') && groups.length > 0) {
      const point = line.slice(1).trim().slice(0, 200)
      if (point) groups[groups.length - 1].points.push(point)
    }
  }
  return groups.filter((g) => g.points.length > 0).slice(0, 12)
}

export const formatGroups = (groups: ServiceGroup[]) =>
  groups.map((g) => [`## ${g.title} | ${g.icon}`, ...g.points.map((p) => `- ${p}`)].join('\n')).join('\n\n')

export function validateService(f: Record<string, unknown>) {
  const name = str(f.name, 60)
  const position = parseIntIn(f.position, 0, 999)
  const imageKey = optStr(f.imageKey, 60)
  const data: ServiceInput = {
    slug: slugify(str(f.slug, 80) || name),
    name,
    summary: str(f.summary, 220),
    icon: isIcon(f.icon) ? f.icon : 'building',
    featured: bool(f.featured),
    published: bool(f.published),
    position: position === 'invalid' || position === null ? 0 : position,
    h1: str(f.h1, 110),
    metaTitle: str(f.metaTitle, 70),
    metaDescription: str(f.metaDescription, 170),
    imageKey: imageKey && (IMAGE_KEYS as readonly string[]).includes(imageKey) ? imageKey : null,
    imageAlt: optStr(f.imageAlt, 200),
    photoBrief: optStr(f.photoBrief, 300),
    intro: lines(f.intro, 6, 600),
    includes: lines(f.includes, 20, 200),
    forWhom: lines(f.forWhom, 12, 80),
    howItWorks: parseSteps(f.howItWorks),
    groups: parseGroups(f.groups),
    relatedIds: (Array.isArray(f.relatedIds) ? f.relatedIds : [f.relatedIds])
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 6),
  }
  const e: FieldErrors<keyof ServiceInput> = {}
  if (!SLUG_RE.test(data.slug)) e.slug = 'Adresse invalide : lettres minuscules, chiffres et tirets.'
  if (!len(data.name, 2, 60)) e.name = 'Nom : 2 à 60 caractères.'
  if (!len(data.summary, 10, 220)) e.summary = 'Résumé : 10 à 220 caractères.'
  if (!len(data.h1, 5, 110)) e.h1 = 'Titre de page : 5 à 110 caractères.'
  if (!len(data.metaTitle, 10, 70)) e.metaTitle = 'Titre Google : 10 à 70 caractères.'
  if (!len(data.metaDescription, 50, 170)) e.metaDescription = 'Description Google : 50 à 170 caractères.'
  if (data.intro.length === 0) e.intro = 'Au moins un paragraphe d’introduction.'
  if (data.imageKey && !data.imageAlt) e.imageAlt = 'Décrivez la photo (texte alternatif).'
  if (position === 'invalid') e.position = 'Ordre : nombre entre 0 et 999.'
  return { data, errors: e }
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
export function validateFaq(f: Record<string, unknown>) {
  const position = parseIntIn(f.position, 0, 999)
  const serviceId = Number(f.serviceId)
  const data = {
    question: str(f.question, 200),
    answer: str(f.answer, 1500),
    serviceId: Number.isInteger(serviceId) && serviceId > 0 ? serviceId : null,
    position: position === 'invalid' || position === null ? 0 : position,
    published: bool(f.published),
  }
  const e: FieldErrors<'question' | 'answer' | 'position'> = {}
  if (!len(data.question, 5, 200)) e.question = 'Question : 5 à 200 caractères.'
  if (!len(data.answer, 5, 1500)) e.answer = 'Réponse : 5 à 1 500 caractères.'
  if (position === 'invalid') e.position = 'Ordre : nombre entre 0 et 999.'
  return { data, errors: e }
}

// ---------------------------------------------------------------------------
// Secteurs
// ---------------------------------------------------------------------------
export function validateSector(f: Record<string, unknown>) {
  const name = str(f.name, 60)
  const position = parseIntIn(f.position, 0, 999)
  const data = {
    slug: slugify(str(f.slug, 60) || name),
    name,
    icon: (isIcon(f.icon) ? f.icon : 'building') as IconName,
    challenge: str(f.challenge, 400),
    approach: str(f.approach, 400),
    examples: lines(f.examples, 10, 80),
    position: position === 'invalid' || position === null ? 0 : position,
    published: bool(f.published),
    serviceIds: (Array.isArray(f.serviceIds) ? f.serviceIds : [f.serviceIds])
      .map((x) => Number(x))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 6),
  }
  const e: FieldErrors<'slug' | 'name' | 'challenge' | 'approach' | 'position'> = {}
  if (!SLUG_RE.test(data.slug)) e.slug = 'Identifiant invalide.'
  if (!len(data.name, 2, 60)) e.name = 'Nom : 2 à 60 caractères.'
  if (!len(data.challenge, 10, 400)) e.challenge = 'Enjeux : 10 à 400 caractères.'
  if (!len(data.approach, 10, 400)) e.approach = 'Réponse : 10 à 400 caractères.'
  if (position === 'invalid') e.position = 'Ordre : nombre entre 0 et 999.'
  return { data, errors: e }
}
