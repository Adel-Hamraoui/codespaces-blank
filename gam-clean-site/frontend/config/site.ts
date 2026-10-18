// ============================================================================
// Textes généraux du site construits à partir des informations de l'entreprise
// (back-office) : aucun lieu ni promesse n'est écrit en dur.
// ============================================================================
import type { SiteSettings } from '@/shared/types/content'

export const homeTitle = (s: SiteSettings) =>
  `${s.companyName} — Entreprise de nettoyage professionnel à ${s.address.city} (${s.address.departmentCode})`

export const siteDescription = (s: SiteSettings, freeQuote: boolean) =>
  `Nettoyage de bureaux, commerces, sites industriels, vitres, fin de chantier et remise en état. Basés à ${s.address.city} (${s.address.departmentCode}), en ${s.address.region}.${freeQuote ? ' Devis gratuit.' : ''}`
