// ============================================================================
// Index léger des prestations (nom, résumé, icône).
// Utilisé par les composants exécutés dans le navigateur (menu, formulaire)
// pour ne pas embarquer tout le contenu des pages dans le JavaScript.
// Le détail de chaque prestation est dans content/services.ts.
// ============================================================================

export type IconName =
  | 'building'
  | 'store'
  | 'factory'
  | 'facade'
  | 'hardhat'
  | 'droplets'
  | 'layers'
  | 'flask'
  | 'waves'
  | 'road'
  | 'flame'
  | 'truck'
  | 'city'
  | 'landmark'
  | 'medical'

export type ServiceSummary = {
  slug: string
  /** Libellé court (menus, cartes, formulaire). */
  name: string
  /** Résumé d'une phrase (cartes, menu). */
  summary: string
  icon: IconName
  /** Prestation principale (carte avec photo) ou complémentaire. */
  featured: boolean
}

export const serviceIndex: ServiceSummary[] = [
  {
    slug: 'nettoyage-de-bureaux',
    name: 'Nettoyage de bureaux',
    summary:
      'Postes de travail, sols, sanitaires, espaces d’accueil : un entretien régulier, organisé autour de vos horaires.',
    icon: 'building',
    featured: true,
  },
  {
    slug: 'commerces-et-erp',
    name: 'Commerces et ERP',
    summary: 'Des espaces impeccables pour vos clients, entretenus avant l’ouverture ou après la fermeture.',
    icon: 'store',
    featured: true,
  },
  {
    slug: 'nettoyage-industriel',
    name: 'Nettoyage industriel',
    summary:
      'Ateliers, entrepôts, machines : dégraissage, aspiration industrielle et haute pression, dans le respect de vos consignes.',
    icon: 'factory',
    featured: true,
  },
  {
    slug: 'vitres-et-facades',
    name: 'Vitres et façades',
    summary: 'Vitres intérieures et extérieures, vitrines, façades : des surfaces vitrées nettes, même en hauteur.',
    icon: 'facade',
    featured: true,
  },
  {
    slug: 'nettoyage-apres-travaux',
    name: 'Fin de chantier',
    summary: 'Poussières, gravats, résidus : des locaux remis en état et prêts à être livrés ou occupés.',
    icon: 'hardhat',
    featured: true,
  },
  {
    slug: 'remise-en-etat-apres-sinistre',
    name: 'Après sinistre',
    summary:
      'Dégât des eaux, incendie, événement : nettoyage et remise en état pour retrouver des locaux utilisables.',
    icon: 'droplets',
    featured: false,
  },
  {
    slug: 'prestations-specialisees',
    name: 'Prestations spécialisées',
    summary: 'Zones sensibles, sols techniques, ventilation, piscines, voiries, conduits, citernes et véhicules.',
    icon: 'layers',
    featured: false,
  },
]
