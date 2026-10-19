// ============================================================================
// Constantes partagées (navigateur + serveur). Aucune dépendance.
// Les valeurs techniques correspondent aux types énumérés de la base (gam.*).
// ============================================================================

export const SERVICE_ICONS = [
  'building',
  'store',
  'factory',
  'facade',
  'hardhat',
  'droplets',
  'layers',
  'flask',
  'waves',
  'road',
  'flame',
  'truck',
  'city',
  'landmark',
  'medical',
] as const
export type IconName = (typeof SERVICE_ICONS)[number]

export const ICON_LABELS: Record<IconName, string> = {
  building: 'Immeuble de bureaux',
  store: 'Commerce',
  factory: 'Usine',
  facade: 'Façade',
  hardhat: 'Casque de chantier',
  droplets: 'Gouttes d’eau',
  layers: 'Couches',
  flask: 'Laboratoire',
  waves: 'Piscine',
  road: 'Voirie',
  flame: 'Flamme',
  truck: 'Camion',
  city: 'Immeubles',
  landmark: 'Bâtiment public',
  medical: 'Santé',
}

/** Photos disponibles (fichiers dans assets/images, associés dans frontend/assets/images.ts). */
export const IMAGE_KEYS = [
  'poste-de-travail',
  'hall-vitres',
  'industriel-haute-pression',
  'facade-vitree',
  'fin-de-chantier',
  'point-de-suivi',
] as const
export type ImageKey = (typeof IMAGE_KEYS)[number]

/** Choix « Autre besoin » du formulaire de devis (pas une prestation en base). */
export const OTHER_SERVICE = 'autre'

export type RequestType = 'devis' | 'contact'

export const LEAD_STATUSES = [
  { value: 'new', label: 'Nouvelle', tone: 'info' },
  { value: 'in_progress', label: 'En cours', tone: 'warning' },
  { value: 'quote_sent', label: 'Devis envoyé', tone: 'accent' },
  { value: 'won', label: 'Gagnée', tone: 'success' },
  { value: 'lost', label: 'Perdue', tone: 'neutral' },
  { value: 'spam', label: 'Indésirable', tone: 'danger' },
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]['value']
export type Tone = (typeof LEAD_STATUSES)[number]['tone']

export const LEAD_TYPES = [
  { value: 'quote', label: 'Devis' },
  { value: 'contact', label: 'Message' },
] as const
export type LeadType = (typeof LEAD_TYPES)[number]['value']

export const FREQUENCIES = [
  { value: 'one_off', label: 'Intervention ponctuelle' },
  { value: 'recurring', label: 'Entretien régulier' },
  { value: 'undecided', label: 'À définir ensemble' },
] as const
export type Frequency = (typeof FREQUENCIES)[number]['value']

export const PROFILES = [
  { value: 'company', label: 'Entreprise' },
  { value: 'retail', label: 'Commerce ou ERP' },
  { value: 'industry', label: 'Site industriel ou logistique' },
  { value: 'condominium', label: 'Syndic ou copropriété' },
  { value: 'public_sector', label: 'Collectivité' },
  { value: 'healthcare', label: 'Établissement de santé' },
  { value: 'construction', label: 'Promoteur ou entreprise du BTP' },
  { value: 'individual', label: 'Particulier' },
  { value: 'other', label: 'Autre' },
] as const
export type Profile = (typeof PROFILES)[number]['value']

export const ADMIN_ROLES = [
  { value: 'owner', label: 'Propriétaire', description: 'Tous les droits, dont la gestion des comptes et le journal.' },
  { value: 'editor', label: 'Éditeur', description: 'Demandes, avis clients et contenus du site.' },
  { value: 'sales', label: 'Commercial', description: 'Demandes de devis et de contact uniquement.' },
] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]['value']

export const REVIEW_STATUSES = [
  { value: 'pending', label: 'À modérer', tone: 'warning' },
  { value: 'published', label: 'Publié', tone: 'success' },
  { value: 'rejected', label: 'Refusé', tone: 'neutral' },
] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]['value']

/** Départements d'Île-de-France (référence géographique publique). */
export const IDF_DEPARTMENTS = [
  { code: '75', name: 'Paris' },
  { code: '77', name: 'Seine-et-Marne' },
  { code: '78', name: 'Yvelines' },
  { code: '91', name: 'Essonne' },
  { code: '92', name: 'Hauts-de-Seine' },
  { code: '93', name: 'Seine-Saint-Denis' },
  { code: '94', name: 'Val-de-Marne' },
  { code: '95', name: 'Val-d’Oise' },
] as const

export const labelOf = <T extends { value: string; label: string }>(list: readonly T[], value: string | null | undefined) =>
  list.find((i) => i.value === value)?.label ?? ''
