// ============================================================================
// CONTENU PAR DÉFAUT — repris du site (plaquette commerciale de GAM CLEAN).
// ----------------------------------------------------------------------------
// Deux usages :
//   1. Initialisation de la base (npm run db:seed) : ces textes deviennent
//      modifiables depuis le back-office.
//   2. Repli si la base n'est pas configurée ou momentanément injoignable :
//      le site reste en ligne avec ce contenu.
// Aucune affirmation non confirmée n'est publiée (claims.confirmed = false).
// ============================================================================
import type { IconName } from '@/shared/constants'
import type { Claim, HowItWorksStep, ServiceGroup, SiteSettings } from '@/shared/types/content'

export type DefaultService = {
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
  related: string[]
  faq: { question: string; answer: string }[]
}

export type DefaultSector = {
  slug: string
  name: string
  icon: IconName
  challenge: string
  approach: string
  examples: string[]
  services: string[]
  position: number
}

export const defaultSettings: SiteSettings = {
  companyName: "GAM CLEAN",
  legalName: "GAM CLEAN",
  legalForm: null,
  shareCapital: null,
  siret: "10330957100018",
  vatNumber: "FR48103309571",
  registration: null,
  apeCode: null,
  publicationDirector: null,
  foundedYear: null,
  phone: {
    display: "07 51 37 94 55",
    e164: "+33751379455",
    href: "tel:+33751379455"
  },
  email: "contact.gmaclean@gmail.com",
  address: {
    street: null,
    postalCode: "93140",
    city: "Bondy",
    department: "Seine-Saint-Denis",
    departmentCode: "93",
    region: "Île-de-France",
    country: "FR"
  },
  serviceArea: {
    short: "Bondy (93) et Île-de-France",
    long: "Basés à Bondy, en Seine-Saint-Denis, nous intervenons dans toute l’Île-de-France.",
    areas: [
      "Bondy",
      "Seine-Saint-Denis",
      "Île-de-France"
    ]
  },
  openingHours: null,
  responseTime: null,
  linkedin: {
    url: "https://www.linkedin.com/company/gam-glean/about/",
    confirmed: false
  },
  host: {
    name: "Vercel Inc.",
    address: null,
    website: "https://vercel.com"
  },
  leadRetentionMonths: 36
}

export const defaultClaims: Claim[] = [
  {
    key: "freeQuote",
    title: "Devis gratuit et sans engagement",
    body: "Le devis est établi après analyse de votre besoin. Vous restez libre de votre décision.",
    confirmed: true,
    position: 0
  },
  {
    key: "availability247",
    title: "Disponibles 7j/7 et 24h/24",
    body: "Une ligne joignable à toute heure pour les besoins urgents.",
    confirmed: false,
    position: 1
  },
  {
    key: "qualifiedRopeAccess",
    title: "Cordistes qualifiés",
    body: "Les travaux en hauteur sont réalisés par des cordistes qualifiés.",
    confirmed: false,
    position: 2
  },
  {
    key: "ecoProducts",
    title: "Produits éco-responsables",
    body: "Des produits choisis pour limiter l’impact environnemental de l’entretien.",
    confirmed: false,
    position: 3
  },
  {
    key: "insurance",
    title: "Assurance responsabilité civile professionnelle",
    body: "Attestation d’assurance disponible sur demande.",
    confirmed: false,
    position: 4
  },
  {
    key: "safetyProtocols",
    title: "Protocoles de sécurité",
    body: "Respect des règles QHSE propres à chaque site.",
    confirmed: false,
    position: 5
  },
  {
    key: "trainedStaff",
    title: "Personnel formé",
    body: "Des intervenants formés aux techniques et aux produits utilisés.",
    confirmed: false,
    position: 6
  }
]

export const defaultServices: DefaultService[] = [
  {
    slug: "nettoyage-de-bureaux",
    name: "Nettoyage de bureaux",
    summary: "Postes de travail, sols, sanitaires, espaces d’accueil : un entretien régulier, organisé autour de vos horaires.",
    icon: "building",
    featured: true,
    published: true,
    position: 0,
    h1: "Nettoyage de bureaux et d’espaces tertiaires",
    metaTitle: "Nettoyage de bureaux à Bondy et en Île-de-France",
    metaDescription: "Entretien de bureaux, open spaces, salles de réunion et sanitaires, à la fréquence et aux horaires qui conviennent à vos équipes. Devis gratuit en Île-de-France.",
    imageKey: "poste-de-travail",
    imageAlt: "Agente d’entretien essuyant un bureau dans un espace de travail lumineux",
    photoBrief: "Un intervenant GAM CLEAN en tenue, dans des bureaux réellement entretenus (avec l’accord du client).",
    intro: [
      "Des bureaux propres, ce sont des équipes qui travaillent dans de bonnes conditions et des visiteurs bien accueillis. GAM CLEAN prend en charge l’entretien de vos espaces de travail pour que vous n’ayez plus à vous en occuper.",
      "Le contenu de chaque passage, sa fréquence et ses horaires sont définis avec vous après une visite de vos locaux."
    ],
    includes: [
      "Entretien des postes de travail, salles de réunion et espaces d’accueil",
      "Dépoussiérage, aspiration et lavage des sols",
      "Entretien des sanitaires",
      "Désinfection des points de contact : poignées, interrupteurs, surfaces partagées",
      "Gestion des déchets",
      "Réapprovisionnement des consommables"
    ],
    forWhom: [
      "Bureaux et open spaces",
      "Sièges sociaux",
      "Espaces de coworking",
      "Agences"
    ],
    howItWorks: [
      {
        title: "Une fréquence adaptée",
        text: "Passage quotidien, plusieurs fois par semaine ou hebdomadaire, selon l’occupation de vos locaux."
      },
      {
        title: "Des créneaux qui ne gênent personne",
        text: "Tôt le matin, en soirée ou à un autre moment convenu, pour ne pas perturber vos équipes."
      },
      {
        title: "Un cahier des charges écrit",
        text: "Le devis détaille ce qui est fait à chaque passage : vous savez exactement ce que vous payez."
      }
    ],
    groups: [],
    related: [
      "commerces-et-erp",
      "vitres-et-facades",
      "nettoyage-apres-travaux"
    ],
    faq: [
      {
        question: "Pouvez-vous intervenir en dehors des heures de bureau ?",
        answer: "Oui. Les créneaux sont fixés avec vous (tôt le matin, en soirée ou à un autre moment) pour que l’entretien ne perturbe pas votre activité."
      },
      {
        question: "Le matériel et les produits sont-ils fournis ?",
        answer: "Oui, GAM CLEAN intervient avec son propre matériel professionnel. Les produits sont choisis selon la nature de vos surfaces."
      },
      {
        question: "Peut-on commencer par une intervention ponctuelle ?",
        answer: "Oui. Une intervention ponctuelle est possible, en complément ou en amont d’un contrat d’entretien régulier."
      }
    ]
  },
  {
    slug: "commerces-et-erp",
    name: "Commerces et ERP",
    summary: "Des espaces impeccables pour vos clients, entretenus avant l’ouverture ou après la fermeture.",
    icon: "store",
    featured: true,
    published: true,
    position: 1,
    h1: "Nettoyage de commerces et d’établissements recevant du public",
    metaTitle: "Nettoyage de commerces et ERP en Île-de-France",
    metaDescription: "Entretien de boutiques, centres commerciaux, hôtels et restaurants avant l’ouverture ou après la fermeture : zones d’accueil, vitrines, sanitaires. Devis gratuit.",
    imageKey: "hall-vitres",
    imageAlt: "Lavage du sol d’un hall vitré à l’autolaveuse pendant qu’une intervenante nettoie les vitres",
    photoBrief: "Une intervention dans un commerce ou un hall d’accueil client, hors horaires d’ouverture.",
    intro: [
      "Dans un commerce, un hôtel ou un restaurant, la propreté fait partie de l’accueil. Elle doit être irréprochable dès l’ouverture des portes, sans gêner vos clients ni votre personnel.",
      "GAM CLEAN organise l’entretien en dehors ou en marge de vos horaires d’ouverture, en priorité sur les zones les plus visibles."
    ],
    includes: [
      "Entretien avant l’ouverture, après la fermeture ou de nuit",
      "Propreté des zones d’accueil et de circulation du public",
      "Vitrines et surfaces de vente",
      "Sanitaires accessibles au public",
      "Respect des règles d’hygiène applicables à votre activité"
    ],
    forWhom: [
      "Commerces et boutiques",
      "Centres commerciaux",
      "Hôtels",
      "Restaurants"
    ],
    howItWorks: [
      {
        title: "Hors de la vue de vos clients",
        text: "Les passages sont calés sur vos horaires d’ouverture pour que les espaces soient prêts quand le public arrive."
      },
      {
        title: "Priorité aux zones visibles",
        text: "Entrée, vitrines, caisses, sanitaires : le plan d’entretien tient compte de ce que vos clients voient en premier."
      },
      {
        title: "Une fréquence alignée sur votre activité",
        text: "La fréquence est ajustée selon la fréquentation de votre établissement et ses pics d’activité."
      }
    ],
    groups: [],
    related: [
      "nettoyage-de-bureaux",
      "vitres-et-facades",
      "remise-en-etat-apres-sinistre"
    ],
    faq: [
      {
        question: "Intervenez-vous avant l’ouverture ou après la fermeture ?",
        answer: "Oui, c’est le principe : les créneaux sont définis avec vous pour que l’entretien se fasse sans public."
      },
      {
        question: "Pouvez-vous entretenir les vitrines ?",
        answer: "Oui, l’entretien des vitrines peut être intégré à la prestation. Pour les vitrages en hauteur ou les façades, consultez la prestation Vitres et façades."
      }
    ]
  },
  {
    slug: "nettoyage-industriel",
    name: "Nettoyage industriel",
    summary: "Ateliers, entrepôts, machines : dégraissage, aspiration industrielle et haute pression, dans le respect de vos consignes.",
    icon: "factory",
    featured: true,
    published: true,
    position: 2,
    h1: "Nettoyage industriel : ateliers, entrepôts et zones logistiques",
    metaTitle: "Nettoyage industriel en Île-de-France",
    metaDescription: "Nettoyage d’ateliers de production, d’entrepôts et de sites logistiques : machines, dégraissage, aspiration industrielle, haute pression. Devis gratuit.",
    imageKey: "industriel-haute-pression",
    imageAlt: "Intervenant en tenue de protection nettoyant une ligne de production au jet haute pression",
    photoBrief: "Une intervention sur un site industriel réel (avec autorisation), équipements de protection visibles.",
    intro: [
      "Un site de production ou un entrepôt propre, c’est un environnement de travail plus sûr et des équipements mieux préservés. Ces espaces demandent des méthodes et du matériel adaptés.",
      "Avant toute intervention, GAM CLEAN visite le site pour repérer les zones, les surfaces et les consignes de sécurité à respecter."
    ],
    includes: [
      "Entretien d’ateliers de production, d’entrepôts et de zones logistiques",
      "Nettoyage de machines et d’équipements industriels",
      "Dégraissage des sols et des surfaces",
      "Aspiration industrielle",
      "Nettoyage haute pression",
      "Respect des consignes de sécurité et environnementales de votre site"
    ],
    forWhom: [
      "Usines",
      "Ateliers",
      "Entrepôts",
      "Sites logistiques"
    ],
    howItWorks: [
      {
        title: "Une visite préalable du site",
        text: "Zones à traiter, types de surfaces, consignes de sécurité : tout est relevé avant d’établir le devis."
      },
      {
        title: "Un planning compatible avec la production",
        text: "Les interventions sont programmées sur les créneaux que vous indiquez, en fonction de votre activité."
      },
      {
        title: "Des méthodes adaptées à chaque zone",
        text: "Dégraissage, aspiration ou haute pression : la technique est choisie selon la surface et le niveau d’encrassement."
      }
    ],
    groups: [],
    related: [
      "nettoyage-apres-travaux",
      "prestations-specialisees",
      "vitres-et-facades"
    ],
    faq: [
      {
        question: "Pouvez-vous intervenir pendant un arrêt de production ?",
        answer: "Les créneaux sont définis avec vous en fonction de votre planning. Précisez vos contraintes dans la demande de devis."
      },
      {
        question: "Comment vos consignes de sécurité sont-elles prises en compte ?",
        answer: "Les consignes propres à votre site sont recueillies lors de la visite préalable et intégrées à l’organisation de l’intervention."
      }
    ]
  },
  {
    slug: "vitres-et-facades",
    name: "Vitres et façades",
    summary: "Vitres intérieures et extérieures, vitrines, façades : des surfaces vitrées nettes, même en hauteur.",
    icon: "facade",
    featured: true,
    published: true,
    position: 3,
    h1: "Nettoyage de vitres et de façades, y compris en hauteur",
    metaTitle: "Nettoyage de vitres et façades en Île-de-France",
    metaDescription: "Nettoyage de vitres intérieures et extérieures, baies vitrées, vitrines et façades, y compris en hauteur. Interventions ponctuelles ou périodiques. Devis gratuit.",
    imageKey: "facade-vitree",
    imageAlt: "Cordiste suspendu nettoyant la façade vitrée d’un immeuble",
    photoBrief: "Un nettoyage de façade ou de vitrage en hauteur réalisé par GAM CLEAN, vue large du bâtiment.",
    intro: [
      "Des vitrages sales se remarquent immédiatement, de l’intérieur comme de l’extérieur. Leur entretien régulier participe directement à l’image de votre bâtiment.",
      "GAM CLEAN nettoie les vitres, vitrines et façades, y compris celles qui nécessitent des travaux en hauteur."
    ],
    includes: [
      "Vitres intérieures et extérieures",
      "Baies vitrées, cloisons vitrées et vitrines",
      "Nettoyage et entretien de façades",
      "Travaux en hauteur"
    ],
    forWhom: [
      "Immeubles de bureaux",
      "Commerces",
      "Copropriétés",
      "Bâtiments publics"
    ],
    howItWorks: [
      {
        title: "Un repérage des accès",
        text: "Hauteur, type de vitrage et accès au bâtiment déterminent la méthode d’intervention."
      },
      {
        title: "Ponctuel ou périodique",
        text: "Une intervention unique ou un passage régulier, selon l’exposition du bâtiment et vos attentes."
      },
      {
        title: "Une coordination avec le bâtiment",
        text: "Les modalités d’accès sont organisées avec vous, votre gestionnaire ou votre syndic."
      }
    ],
    groups: [],
    related: [
      "nettoyage-de-bureaux",
      "commerces-et-erp",
      "prestations-specialisees"
    ],
    faq: [
      {
        question: "Intervenez-vous sur des façades en hauteur ?",
        answer: "Oui, le nettoyage de vitres et de façades en hauteur fait partie des prestations. La méthode d’accès est déterminée après étude du bâtiment."
      },
      {
        question: "À quelle fréquence faut-il nettoyer les vitres ?",
        answer: "Cela dépend de l’exposition du bâtiment, de son environnement et de l’image que vous souhaitez donner. La fréquence est définie avec vous dans le devis."
      }
    ]
  },
  {
    slug: "nettoyage-apres-travaux",
    name: "Fin de chantier",
    summary: "Poussières, gravats, résidus : des locaux remis en état et prêts à être livrés ou occupés.",
    icon: "hardhat",
    featured: true,
    published: true,
    position: 4,
    h1: "Nettoyage de fin de chantier et remise en état après travaux",
    metaTitle: "Nettoyage de fin de chantier en Île-de-France",
    metaDescription: "Remise en état après construction ou rénovation : poussières, gravats, résidus de chantier et nettoyage fin avant livraison des locaux. Devis gratuit.",
    imageKey: "fin-de-chantier",
    imageAlt: "Deux intervenants aspirant et balayant un plateau vide après travaux",
    photoBrief: "Un avant / après réel d’un chantier nettoyé par GAM CLEAN (avec l’accord du maître d’ouvrage).",
    intro: [
      "À la fin d’un chantier, il reste toujours de la poussière fine, des gravats et des traces sur toutes les surfaces. Avant une livraison ou un emménagement, il faut tout remettre au propre.",
      "GAM CLEAN prend en charge ce nettoyage pour livrer des locaux prêts à l’usage."
    ],
    includes: [
      "Remise en état après construction ou rénovation",
      "Élimination des poussières, gravats et résidus de chantier",
      "Nettoyage fin des sols, menuiseries et vitrages",
      "Locaux livrés prêts à l’usage"
    ],
    forWhom: [
      "Promoteurs",
      "Entreprises du bâtiment",
      "Entreprises qui emménagent",
      "Copropriétés après travaux"
    ],
    howItWorks: [
      {
        title: "Une évaluation sur place",
        text: "Surface, état du chantier et volume à traiter sont évalués avant d’établir le devis."
      },
      {
        title: "Calée sur votre planning",
        text: "L’intervention est programmée en fonction de votre date de livraison ou d’emménagement."
      },
      {
        title: "En une ou plusieurs étapes",
        text: "Selon l’avancement des travaux, le nettoyage peut être réalisé en une fois ou en plusieurs passages, à définir ensemble."
      }
    ],
    groups: [],
    related: [
      "remise-en-etat-apres-sinistre",
      "vitres-et-facades",
      "nettoyage-industriel"
    ],
    faq: [
      {
        question: "Quand faut-il programmer le nettoyage de fin de chantier ?",
        answer: "En général une fois les corps de métier partis. Le moment exact est défini avec vous selon votre date de livraison."
      },
      {
        question: "Les gravats sont-ils pris en charge ?",
        answer: "L’élimination des poussières, gravats et résidus de chantier fait partie de la prestation. Le volume est évalué lors de la visite et précisé dans le devis."
      }
    ]
  },
  {
    slug: "remise-en-etat-apres-sinistre",
    name: "Après sinistre",
    summary: "Dégât des eaux, incendie, événement : nettoyage et remise en état pour retrouver des locaux utilisables.",
    icon: "droplets",
    featured: false,
    published: true,
    position: 5,
    h1: "Remise en état après sinistre et nettoyage post-événement",
    metaTitle: "Remise en état après sinistre : dégât des eaux, incendie",
    metaDescription: "Nettoyage et assèchement après dégât des eaux, remise en état des surfaces après incendie ou catastrophe naturelle, nettoyage après événement. Île-de-France.",
    imageKey: null,
    imageAlt: null,
    photoBrief: "Une intervention réelle après dégât des eaux (matériel d’assèchement visible), sans information permettant d’identifier le client.",
    intro: [
      "Après un dégât des eaux, un incendie ou un événement, l’objectif est de retrouver rapidement des locaux propres et utilisables.",
      "GAM CLEAN intervient pour le nettoyage et la remise en état des surfaces concernées. Le plus simple est de nous appeler pour décrire la situation."
    ],
    includes: [
      "Nettoyage et assèchement après dégât des eaux",
      "Remise en état des surfaces après incendie ou catastrophe naturelle",
      "Nettoyage après un événement",
      "Remise en état d’espaces naturels aménagés et de plages"
    ],
    forWhom: [
      "Entreprises",
      "Commerces",
      "Copropriétés",
      "Collectivités"
    ],
    howItWorks: [
      {
        title: "Un premier échange par téléphone",
        text: "Décrivez la situation : nature du sinistre, surfaces touchées, contraintes d’accès."
      },
      {
        title: "Une évaluation sur place",
        text: "Les surfaces à traiter et les opérations nécessaires sont identifiées avec vous."
      },
      {
        title: "Un devis détaillé",
        text: "Les opérations prévues sont détaillées avant l’intervention."
      }
    ],
    groups: [],
    related: [
      "nettoyage-apres-travaux",
      "commerces-et-erp",
      "nettoyage-de-bureaux"
    ],
    faq: [
      {
        question: "Que faire en cas de dégât des eaux ?",
        answer: "Appelez-nous directement pour décrire la situation : c’est le moyen le plus rapide d’organiser une intervention."
      }
    ]
  },
  {
    slug: "prestations-specialisees",
    name: "Prestations spécialisées",
    summary: "Zones sensibles, sols techniques, ventilation, piscines, voiries, conduits, citernes et véhicules.",
    icon: "layers",
    featured: false,
    published: true,
    position: 6,
    h1: "Prestations de nettoyage spécialisées",
    metaTitle: "Prestations de nettoyage spécialisées",
    metaDescription: "Zones sensibles et sols techniques, ventilation, piscines, voiries et déneigement, ramonage, citernes et véhicules : les prestations spécialisées de GAM CLEAN.",
    imageKey: null,
    imageAlt: null,
    photoBrief: "Une photo par spécialité réellement pratiquée (salle technique, bassin, voirie…), prise lors d’une intervention GAM CLEAN.",
    intro: [
      "Au-delà de l’entretien courant, certains espaces et équipements demandent des techniques spécifiques. GAM CLEAN propose plusieurs prestations spécialisées, en intervention ponctuelle ou dans le cadre d’un contrat.",
      "Décrivez votre besoin : nous vous indiquerons comment il peut être pris en charge."
    ],
    includes: [],
    forWhom: [
      "Laboratoires",
      "Copropriétés",
      "Hôtels et établissements de loisirs",
      "Collectivités",
      "Transporteurs"
    ],
    howItWorks: [
      {
        title: "Décrivez le besoin",
        text: "Type d’équipement ou d’espace, contraintes d’accès, fréquence souhaitée."
      },
      {
        title: "Étude et visite",
        text: "La faisabilité et la méthode sont étudiées, avec une visite si nécessaire."
      },
      {
        title: "Une proposition détaillée",
        text: "Le devis précise les opérations prévues et leur organisation."
      }
    ],
    groups: [
      {
        id: "zones-sensibles",
        title: "Zones sensibles et équipements techniques",
        icon: "flask",
        points: [
          "Nettoyage de zones sensibles : laboratoires, salles blanches",
          "Décontamination et traitement des surfaces",
          "Entretien de sols techniques : résine, carrelage industriel",
          "Nettoyage de systèmes de ventilation et de climatisation"
        ]
      },
      {
        id: "piscines",
        title: "Piscines",
        icon: "waves",
        points: [
          "Traitement et entretien des bassins, plages et locaux techniques",
          "Nettoyage des équipements filtrants et des margelles",
          "Pour les copropriétés, hôtels et établissements de loisirs"
        ]
      },
      {
        id: "exterieurs-voiries",
        title: "Espaces extérieurs et voiries",
        icon: "road",
        points: [
          "Balayage, lavage et remise en état des chaussées et espaces communs extérieurs",
          "Déneigement et salage des accès, parkings et zones de circulation",
          "Nettoyage des caniveaux, cours intérieures et espaces attenants"
        ]
      },
      {
        id: "cheminees-conduits",
        title: "Cheminées et conduits",
        icon: "flame",
        points: [
          "Ramonage et nettoyage des cheminées, âtres et conduits de fumée",
          "Dégagement et nettoyage des conduits de ventilation (colonnes)"
        ]
      },
      {
        id: "transport-citernes",
        title: "Matériels de transport et citernes",
        icon: "truck",
        points: [
          "Nettoyage courant de véhicules de transport collectif : bus, navettes d’entreprise",
          "Nettoyage intérieur de citernes de transport routier",
          "Nettoyage de bouteilles et de contenants industriels"
        ]
      }
    ],
    related: [
      "nettoyage-industriel",
      "vitres-et-facades",
      "remise-en-etat-apres-sinistre"
    ],
    faq: [
      {
        question: "Mon besoin n’apparaît pas dans la liste. Pouvez-vous m’aider ?",
        answer: "Décrivez-le dans le formulaire de devis ou par téléphone : chaque demande est étudiée selon la nature de vos locaux et de vos équipements."
      }
    ]
  }
]

export const defaultFaq: { question: string; answer: string }[] = [
  {
    question: "Quels types de locaux nettoyez-vous ?",
    answer: "Bureaux, commerces et établissements recevant du public, sites industriels et logistiques, copropriétés, bâtiments de collectivités et établissements de santé. Nous réalisons aussi des prestations spécialisées : vitres en hauteur, fin de chantier, remise en état après sinistre, piscines, voiries, conduits."
  },
  {
    question: "Dans quelles zones intervenez-vous ?",
    answer: "Nous sommes basés à Bondy (93) et intervenons en Seine-Saint-Denis et dans toute l’Île-de-France."
  },
  {
    question: "Proposez-vous des interventions ponctuelles ?",
    answer: "Oui : nettoyage de fin de chantier, remise en état, vitres, nettoyage après un événement… Une intervention ponctuelle peut aussi précéder un contrat régulier."
  },
  {
    question: "Proposez-vous des contrats d’entretien réguliers ?",
    answer: "Oui. La fréquence (quotidienne, plusieurs fois par semaine, hebdomadaire, mensuelle) et les horaires sont définis selon vos besoins."
  },
  {
    question: "Comment se passe une demande de devis ?",
    answer: "Vous décrivez votre besoin via le formulaire ou par téléphone. Nous organisons ensuite une visite de vos locaux pour évaluer les surfaces et vos contraintes, puis nous vous adressons un devis détaillé."
  },
  {
    question: "Le devis est-il gratuit ?",
    answer: "Oui, le devis est gratuit et sans engagement : vous restez entièrement libre de votre décision."
  },
  {
    question: "Pouvez-vous intervenir en dehors des horaires de bureau ?",
    answer: "Oui. Les créneaux sont adaptés à vos contraintes : tôt le matin, en soirée ou à un autre moment convenu ensemble."
  },
  {
    question: "Fournissez-vous le matériel et les produits ?",
    answer: "Oui, nous intervenons avec notre propre matériel professionnel et des produits adaptés à chaque type de surface."
  },
  {
    question: "Intervenez-vous en hauteur ?",
    answer: "Oui, pour le nettoyage de vitres et de façades. La méthode d’accès est déterminée après étude du bâtiment."
  },
  {
    question: "Comment la qualité est-elle suivie dans le temps ?",
    answer: "Le cahier des charges validé ensemble sert de référence. La prestation est ajustée selon vos retours et l’évolution de vos besoins."
  },
  {
    question: "Que faire en cas d’urgence (dégât des eaux, sinistre) ?",
    answer: "Appelez-nous directement au 07 51 37 94 55 pour décrire la situation : c’est le moyen le plus rapide d’organiser une intervention."
  }
]

export const defaultSectors: DefaultSector[] = [
  {
    slug: "entreprises",
    name: "Entreprises et bureaux",
    icon: "building",
    challenge: "Un environnement de travail propre et accueillant au quotidien, sans perturber l’activité des équipes.",
    approach: "Des créneaux adaptés à votre organisation et un plan d’entretien complet des espaces de travail.",
    examples: [
      "Bureaux et open spaces",
      "Salles de réunion",
      "Sanitaires et espaces d’accueil",
      "Sièges sociaux et agences"
    ],
    services: [
      "nettoyage-de-bureaux",
      "vitres-et-facades"
    ],
    position: 0
  },
  {
    slug: "commerces",
    name: "Commerces et ERP",
    icon: "store",
    challenge: "Des espaces qui accueillent du public et doivent être impeccables en permanence, sans gêner l’exploitation.",
    approach: "Des interventions en dehors ou en marge des horaires d’ouverture, avec une attention particulière aux zones de circulation.",
    examples: [
      "Boutiques et centres commerciaux",
      "Hôtels",
      "Restaurants",
      "Vitrines et surfaces de vente"
    ],
    services: [
      "commerces-et-erp",
      "vitres-et-facades"
    ],
    position: 1
  },
  {
    slug: "industrie",
    name: "Industrie et logistique",
    icon: "factory",
    challenge: "Ateliers, entrepôts et zones logistiques exigent des méthodes rigoureuses et le respect des consignes de sécurité.",
    approach: "Des méthodes et du matériel adaptés aux environnements industriels, définis après une visite du site.",
    examples: [
      "Ateliers de production",
      "Entrepôts",
      "Zones logistiques",
      "Machines et équipements"
    ],
    services: [
      "nettoyage-industriel",
      "prestations-specialisees"
    ],
    position: 2
  },
  {
    slug: "coproprietes",
    name: "Copropriétés",
    icon: "city",
    challenge: "Des parties communes propres et sûres pour tous les résidents, avec une continuité de service.",
    approach: "Un entretien régulier des parties communes et un interlocuteur pour le syndic ou le conseil syndical.",
    examples: [
      "Halls et escaliers",
      "Parkings et locaux techniques",
      "Cheminées et conduits",
      "Espaces extérieurs"
    ],
    services: [
      "vitres-et-facades",
      "prestations-specialisees"
    ],
    position: 3
  },
  {
    slug: "collectivites",
    name: "Collectivités",
    icon: "landmark",
    challenge: "Bâtiments administratifs, écoles et équipements publics ont besoin d’un entretien fiable et régulier.",
    approach: "Des interventions programmées selon les horaires des services et la fréquentation de chaque bâtiment.",
    examples: [
      "Mairies et bâtiments administratifs",
      "Écoles et gymnases",
      "Espaces extérieurs et voiries",
      "Interventions hors présence du public"
    ],
    services: [
      "nettoyage-de-bureaux",
      "prestations-specialisees"
    ],
    position: 4
  },
  {
    slug: "sante",
    name: "Santé",
    icon: "medical",
    challenge: "Les établissements de santé imposent des exigences d’hygiène renforcées et une grande rigueur.",
    approach: "Des protocoles d’entretien et de désinfection adaptés aux environnements sensibles.",
    examples: [
      "Cabinets médicaux",
      "Laboratoires",
      "Désinfection des points de contact",
      "Zones sensibles"
    ],
    services: [
      "prestations-specialisees",
      "nettoyage-de-bureaux"
    ],
    position: 5
  }
]
