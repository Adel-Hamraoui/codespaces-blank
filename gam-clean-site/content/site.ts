// ============================================================================
// CONFIGURATION CENTRALE — informations GAM CLEAN
// ----------------------------------------------------------------------------
// Toutes les informations de l'entreprise sont modifiables ICI, et seulement ici.
//
// Règle : on ne publie que ce qui est confirmé.
//   - Une valeur `null` = information inconnue. Elle n'est pas affichée sur le site
//     (ou elle apparaît comme « [À confirmer avec GAM CLEAN] » sur les pages légales).
//   - Une affirmation commerciale (`claims`) n'est affichée que si `confirmed: true`.
//
// Lancez `npm run check:content` pour lister tout ce qui reste à confirmer.
// ============================================================================

export const TO_CONFIRM = '[À confirmer avec GAM CLEAN]'

export const company = {
  name: 'GAM CLEAN',

  /** Raison sociale exacte (avis de situation INSEE / Kbis). */
  legalName: 'GAM CLEAN',

  /** Forme juridique (SAS, SASU, SARL, EI…). */
  legalForm: null as string | null,

  /** Capital social, ex. "1 000 €". */
  shareCapital: null as string | null,

  /** Repris du site actuel. Format SIRET : 14 chiffres. */
  siret: '10330957100018',

  /** Repris du site actuel. Cohérent avec le SIREN (clé vérifiée). */
  vatNumber: 'FR48103309571',

  /** RCS / RNE, ex. "RCS Bobigny 103 309 571". */
  registration: null as string | null,

  /** Code APE réel (avis de situation INSEE), ex. "81.21Z". */
  apeCode: null as string | null,

  /** Nom du représentant légal / directeur de la publication. */
  publicationDirector: null as string | null,

  /** Année de création — affichée sur « À propos » uniquement si renseignée. */
  foundedYear: null as number | null,

  /** Téléphone repris du site actuel. */
  phone: {
    display: '07 51 37 94 55',
    international: '+33 7 51 37 94 55',
    href: 'tel:+33751379455',
  },

  /**
   * E-mail repris du site actuel.
   * ⚠️ À CONFIRMER : « gmaclean » ne correspond pas à l'orthographe de la marque.
   * Idéalement : une adresse sur un nom de domaine propre (ex. contact@gamclean.fr).
   */
  email: 'contact.gmaclean@gmail.com',

  address: {
    /** Adresse postale — non publiée sur le site actuel (« communiquée sur demande »). */
    street: null as string | null,
    postalCode: '93140',
    city: 'Bondy',
    department: 'Seine-Saint-Denis',
    departmentCode: '93',
    region: 'Île-de-France',
    country: 'FR',
  },

  /** Zone d'intervention telle qu'annoncée sur le site actuel. */
  serviceArea: {
    short: 'Bondy (93) et Île-de-France',
    long: 'Basés à Bondy, en Seine-Saint-Denis, nous intervenons dans toute l’Île-de-France.',
    /** Uniquement des zones confirmées. Utilisées dans les données structurées. */
    areas: ['Bondy', 'Seine-Saint-Denis', 'Île-de-France'],
  },

  /**
   * Horaires d'ouverture / de joignabilité.
   * Le site actuel annonce « 7j/7 et 24h/24 » : non publié tant que ce n'est pas confirmé.
   * Exemple de format : [{ days: 'Du lundi au vendredi', hours: '8h – 18h' }]
   */
  openingHours: null as { days: string; hours: string }[] | null,

  /** Délai de réponse aux demandes, ex. "sous 24 heures ouvrées". */
  responseTime: null as string | null,

  social: {
    /** Lien du site actuel — slug « gam-glean » à vérifier avant publication. */
    linkedin: {
      url: 'https://www.linkedin.com/company/gam-glean/about/',
      confirmed: false,
    },
  },

  /** Hébergeur du site (obligatoire dans les mentions légales). */
  host: {
    name: 'Vercel Inc.',
    address: null as string | null, // à recopier depuis https://vercel.com/legal
    website: 'https://vercel.com',
  },
} as const

// ----------------------------------------------------------------------------
// Affirmations commerciales
// ----------------------------------------------------------------------------
// Ces phrases figuraient sur l'ancien site (plaquette commerciale) mais ne sont pas
// documentées. Passez `confirmed: true` UNIQUEMENT si GAM CLEAN peut le prouver
// (attestation, certificat, organisation réelle). Elles s'afficheront alors
// automatiquement dans les sections « Pourquoi GAM CLEAN », FAQ et prestations.
// ----------------------------------------------------------------------------
export const claims = {
  freeQuote: {
    confirmed: true, // annoncé partout sur le site actuel ("Devis gratuit et sans engagement")
    title: 'Devis gratuit et sans engagement',
    text: 'Le devis est établi après analyse de votre besoin. Vous restez libre de votre décision.',
  },
  availability247: {
    confirmed: false,
    title: 'Disponibles 7j/7 et 24h/24',
    text: 'Une ligne joignable à toute heure pour les besoins urgents.',
  },
  qualifiedRopeAccess: {
    confirmed: false,
    title: 'Cordistes qualifiés',
    text: 'Les travaux en hauteur sont réalisés par des cordistes qualifiés.',
  },
  ecoProducts: {
    confirmed: false,
    title: 'Produits éco-responsables',
    text: 'Des produits choisis pour limiter l’impact environnemental de l’entretien.',
  },
  insurance: {
    confirmed: false,
    title: 'Assurance responsabilité civile professionnelle',
    text: 'Attestation d’assurance disponible sur demande.',
  },
  safetyProtocols: {
    confirmed: false,
    title: 'Protocoles de sécurité',
    text: 'Respect des règles QHSE propres à chaque site.',
  },
  trainedStaff: {
    confirmed: false,
    title: 'Personnel formé',
    text: 'Des intervenants formés aux techniques et aux produits utilisés.',
  },
} as const

export type ClaimKey = keyof typeof claims
export const isConfirmed = (key: ClaimKey) => claims[key].confirmed

// ----------------------------------------------------------------------------
// Témoignages clients
// ----------------------------------------------------------------------------
// Vide tant que GAM CLEAN n'a pas de témoignages réels ET l'accord écrit des clients.
// La section « Ils nous font confiance » ne s'affiche pas tant que la liste est vide.
// Ne jamais ajouter de témoignage inventé ou reformulé.
// ----------------------------------------------------------------------------
export type Testimonial = {
  quote: string
  author: string // ex. "Responsable des services généraux"
  organization?: string // uniquement avec l'accord écrit du client
  service?: string
}

export const testimonials: Testimonial[] = []

// ----------------------------------------------------------------------------
// Références clients (logos ou noms) — vide tant qu'aucun accord écrit.
// ----------------------------------------------------------------------------
export const clientReferences: { name: string }[] = []
