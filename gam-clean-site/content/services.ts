// ============================================================================
// PRESTATIONS GAM CLEAN
// ----------------------------------------------------------------------------
// Le périmètre de chaque prestation reprend la plaquette commerciale de GAM CLEAN
// (contenu du site actuel). Les formulations ont été réécrites pour la clarté,
// sans ajouter de promesse, de chiffre ni de garantie.
// ============================================================================
import type { StaticImageData } from 'next/image'
import type { ClaimKey } from './site'
import { serviceIndex, type IconName, type ServiceSummary } from './service-index'

export type { IconName } from './service-index'

import imgBureaux from '@/assets/images/nettoyage-poste-de-travail.jpg'
import imgHall from '@/assets/images/nettoyage-hall-vitres-bureaux.jpg'
import imgIndustriel from '@/assets/images/nettoyage-industriel-haute-pression.jpg'
import imgFacade from '@/assets/images/nettoyage-facade-vitree-hauteur.jpg'
import imgChantier from '@/assets/images/nettoyage-fin-de-chantier.jpg'

export type ServiceDetails = {
  /** H1 de la page. */
  h1: string
  /** Balise <title> (le suffixe « | GAM CLEAN » est ajouté automatiquement). */
  metaTitle: string
  metaDescription: string
  image?: { src: StaticImageData; alt: string }
  /** Photo réelle à prévoir — voir docs/IMAGES.md. */
  photoBrief: string
  intro: string[]
  includes: string[]
  /** Affirmation à ajouter à la liste si elle est confirmée dans content/site.ts. */
  includesClaims?: ClaimKey[]
  forWhom: string[]
  howItWorks: { title: string; text: string }[]
  faq: { question: string; answer: string; claimAddendum?: ClaimKey }[]
  /** Pour la page « Prestations spécialisées » uniquement. */
  groups?: { id: string; title: string; icon: IconName; points: string[] }[]
  related: string[]
}

const details: (ServiceDetails & { slug: string })[] = [
  {
    slug: 'nettoyage-de-bureaux',
    h1: 'Nettoyage de bureaux et d’espaces tertiaires',
    metaTitle: 'Nettoyage de bureaux à Bondy et en Île-de-France',
    metaDescription:
      'Entretien de bureaux, open spaces, salles de réunion et sanitaires, à la fréquence et aux horaires qui conviennent à vos équipes. Devis gratuit en Île-de-France.',
    image: {
      src: imgBureaux,
      alt: 'Agente d’entretien essuyant un bureau dans un espace de travail lumineux',
    },
    photoBrief:
      'Un intervenant GAM CLEAN en tenue, dans des bureaux réellement entretenus (avec l’accord du client).',
    intro: [
      'Des bureaux propres, ce sont des équipes qui travaillent dans de bonnes conditions et des visiteurs bien accueillis. GAM CLEAN prend en charge l’entretien de vos espaces de travail pour que vous n’ayez plus à vous en occuper.',
      'Le contenu de chaque passage, sa fréquence et ses horaires sont définis avec vous après une visite de vos locaux.',
    ],
    includes: [
      'Entretien des postes de travail, salles de réunion et espaces d’accueil',
      'Dépoussiérage, aspiration et lavage des sols',
      'Entretien des sanitaires',
      'Désinfection des points de contact : poignées, interrupteurs, surfaces partagées',
      'Gestion des déchets',
      'Réapprovisionnement des consommables',
    ],
    forWhom: ['Bureaux et open spaces', 'Sièges sociaux', 'Espaces de coworking', 'Agences'],
    howItWorks: [
      {
        title: 'Une fréquence adaptée',
        text: 'Passage quotidien, plusieurs fois par semaine ou hebdomadaire, selon l’occupation de vos locaux.',
      },
      {
        title: 'Des créneaux qui ne gênent personne',
        text: 'Tôt le matin, en soirée ou à un autre moment convenu, pour ne pas perturber vos équipes.',
      },
      {
        title: 'Un cahier des charges écrit',
        text: 'Le devis détaille ce qui est fait à chaque passage : vous savez exactement ce que vous payez.',
      },
    ],
    faq: [
      {
        question: 'Pouvez-vous intervenir en dehors des heures de bureau ?',
        answer:
          'Oui. Les créneaux sont fixés avec vous (tôt le matin, en soirée ou à un autre moment) pour que l’entretien ne perturbe pas votre activité.',
      },
      {
        question: 'Le matériel et les produits sont-ils fournis ?',
        answer:
          'Oui, GAM CLEAN intervient avec son propre matériel professionnel. Les produits sont choisis selon la nature de vos surfaces.',
        claimAddendum: 'ecoProducts',
      },
      {
        question: 'Peut-on commencer par une intervention ponctuelle ?',
        answer:
          'Oui. Une intervention ponctuelle est possible, en complément ou en amont d’un contrat d’entretien régulier.',
      },
    ],
    related: ['commerces-et-erp', 'vitres-et-facades', 'nettoyage-apres-travaux'],
  },
  {
    slug: 'commerces-et-erp',
    h1: 'Nettoyage de commerces et d’établissements recevant du public',
    metaTitle: 'Nettoyage de commerces et ERP en Île-de-France',
    metaDescription:
      'Entretien de boutiques, centres commerciaux, hôtels et restaurants avant l’ouverture ou après la fermeture : zones d’accueil, vitrines, sanitaires. Devis gratuit.',
    image: {
      src: imgHall,
      alt: 'Lavage du sol d’un hall vitré à l’autolaveuse pendant qu’une intervenante nettoie les vitres',
    },
    photoBrief:
      'Une intervention dans un commerce ou un hall d’accueil client, hors horaires d’ouverture.',
    intro: [
      'Dans un commerce, un hôtel ou un restaurant, la propreté fait partie de l’accueil. Elle doit être irréprochable dès l’ouverture des portes, sans gêner vos clients ni votre personnel.',
      'GAM CLEAN organise l’entretien en dehors ou en marge de vos horaires d’ouverture, en priorité sur les zones les plus visibles.',
    ],
    includes: [
      'Entretien avant l’ouverture, après la fermeture ou de nuit',
      'Propreté des zones d’accueil et de circulation du public',
      'Vitrines et surfaces de vente',
      'Sanitaires accessibles au public',
      'Respect des règles d’hygiène applicables à votre activité',
    ],
    forWhom: ['Commerces et boutiques', 'Centres commerciaux', 'Hôtels', 'Restaurants'],
    howItWorks: [
      {
        title: 'Hors de la vue de vos clients',
        text: 'Les passages sont calés sur vos horaires d’ouverture pour que les espaces soient prêts quand le public arrive.',
      },
      {
        title: 'Priorité aux zones visibles',
        text: 'Entrée, vitrines, caisses, sanitaires : le plan d’entretien tient compte de ce que vos clients voient en premier.',
      },
      {
        title: 'Une fréquence alignée sur votre activité',
        text: 'La fréquence est ajustée selon la fréquentation de votre établissement et ses pics d’activité.',
      },
    ],
    faq: [
      {
        question: 'Intervenez-vous avant l’ouverture ou après la fermeture ?',
        answer:
          'Oui, c’est le principe : les créneaux sont définis avec vous pour que l’entretien se fasse sans public.',
      },
      {
        question: 'Pouvez-vous entretenir les vitrines ?',
        answer:
          'Oui, l’entretien des vitrines peut être intégré à la prestation. Pour les vitrages en hauteur ou les façades, consultez la prestation Vitres et façades.',
      },
    ],
    related: ['nettoyage-de-bureaux', 'vitres-et-facades', 'remise-en-etat-apres-sinistre'],
  },
  {
    slug: 'nettoyage-industriel',
    h1: 'Nettoyage industriel : ateliers, entrepôts et zones logistiques',
    metaTitle: 'Nettoyage industriel en Île-de-France',
    metaDescription:
      'Nettoyage d’ateliers de production, d’entrepôts et de sites logistiques : machines, dégraissage, aspiration industrielle, haute pression. Devis gratuit.',
    image: {
      src: imgIndustriel,
      alt: 'Intervenant en tenue de protection nettoyant une ligne de production au jet haute pression',
    },
    photoBrief:
      'Une intervention sur un site industriel réel (avec autorisation), équipements de protection visibles.',
    intro: [
      'Un site de production ou un entrepôt propre, c’est un environnement de travail plus sûr et des équipements mieux préservés. Ces espaces demandent des méthodes et du matériel adaptés.',
      'Avant toute intervention, GAM CLEAN visite le site pour repérer les zones, les surfaces et les consignes de sécurité à respecter.',
    ],
    includes: [
      'Entretien d’ateliers de production, d’entrepôts et de zones logistiques',
      'Nettoyage de machines et d’équipements industriels',
      'Dégraissage des sols et des surfaces',
      'Aspiration industrielle',
      'Nettoyage haute pression',
      'Respect des consignes de sécurité et environnementales de votre site',
    ],
    includesClaims: ['safetyProtocols'],
    forWhom: ['Usines', 'Ateliers', 'Entrepôts', 'Sites logistiques'],
    howItWorks: [
      {
        title: 'Une visite préalable du site',
        text: 'Zones à traiter, types de surfaces, consignes de sécurité : tout est relevé avant d’établir le devis.',
      },
      {
        title: 'Un planning compatible avec la production',
        text: 'Les interventions sont programmées sur les créneaux que vous indiquez, en fonction de votre activité.',
      },
      {
        title: 'Des méthodes adaptées à chaque zone',
        text: 'Dégraissage, aspiration ou haute pression : la technique est choisie selon la surface et le niveau d’encrassement.',
      },
    ],
    faq: [
      {
        question: 'Pouvez-vous intervenir pendant un arrêt de production ?',
        answer:
          'Les créneaux sont définis avec vous en fonction de votre planning. Précisez vos contraintes dans la demande de devis.',
      },
      {
        question: 'Comment vos consignes de sécurité sont-elles prises en compte ?',
        answer:
          'Les consignes propres à votre site sont recueillies lors de la visite préalable et intégrées à l’organisation de l’intervention.',
      },
    ],
    related: ['nettoyage-apres-travaux', 'prestations-specialisees', 'vitres-et-facades'],
  },
  {
    slug: 'vitres-et-facades',
    h1: 'Nettoyage de vitres et de façades, y compris en hauteur',
    metaTitle: 'Nettoyage de vitres et façades en Île-de-France',
    metaDescription:
      'Nettoyage de vitres intérieures et extérieures, baies vitrées, vitrines et façades, y compris en hauteur. Interventions ponctuelles ou périodiques. Devis gratuit.',
    image: {
      src: imgFacade,
      alt: 'Cordiste suspendu nettoyant la façade vitrée d’un immeuble',
    },
    photoBrief:
      'Un nettoyage de façade ou de vitrage en hauteur réalisé par GAM CLEAN, vue large du bâtiment.',
    intro: [
      'Des vitrages sales se remarquent immédiatement, de l’intérieur comme de l’extérieur. Leur entretien régulier participe directement à l’image de votre bâtiment.',
      'GAM CLEAN nettoie les vitres, vitrines et façades, y compris celles qui nécessitent des travaux en hauteur.',
    ],
    includes: [
      'Vitres intérieures et extérieures',
      'Baies vitrées, cloisons vitrées et vitrines',
      'Nettoyage et entretien de façades',
      'Travaux en hauteur',
    ],
    includesClaims: ['qualifiedRopeAccess'],
    forWhom: ['Immeubles de bureaux', 'Commerces', 'Copropriétés', 'Bâtiments publics'],
    howItWorks: [
      {
        title: 'Un repérage des accès',
        text: 'Hauteur, type de vitrage et accès au bâtiment déterminent la méthode d’intervention.',
      },
      {
        title: 'Ponctuel ou périodique',
        text: 'Une intervention unique ou un passage régulier, selon l’exposition du bâtiment et vos attentes.',
      },
      {
        title: 'Une coordination avec le bâtiment',
        text: 'Les modalités d’accès sont organisées avec vous, votre gestionnaire ou votre syndic.',
      },
    ],
    faq: [
      {
        question: 'Intervenez-vous sur des façades en hauteur ?',
        answer:
          'Oui, le nettoyage de vitres et de façades en hauteur fait partie des prestations. La méthode d’accès est déterminée après étude du bâtiment.',
        claimAddendum: 'qualifiedRopeAccess',
      },
      {
        question: 'À quelle fréquence faut-il nettoyer les vitres ?',
        answer:
          'Cela dépend de l’exposition du bâtiment, de son environnement et de l’image que vous souhaitez donner. La fréquence est définie avec vous dans le devis.',
      },
    ],
    related: ['nettoyage-de-bureaux', 'commerces-et-erp', 'prestations-specialisees'],
  },
  {
    slug: 'nettoyage-apres-travaux',
    h1: 'Nettoyage de fin de chantier et remise en état après travaux',
    metaTitle: 'Nettoyage de fin de chantier en Île-de-France',
    metaDescription:
      'Remise en état après construction ou rénovation : poussières, gravats, résidus de chantier et nettoyage fin avant livraison des locaux. Devis gratuit.',
    image: {
      src: imgChantier,
      alt: 'Deux intervenants aspirant et balayant un plateau vide après travaux',
    },
    photoBrief:
      'Un avant / après réel d’un chantier nettoyé par GAM CLEAN (avec l’accord du maître d’ouvrage).',
    intro: [
      'À la fin d’un chantier, il reste toujours de la poussière fine, des gravats et des traces sur toutes les surfaces. Avant une livraison ou un emménagement, il faut tout remettre au propre.',
      'GAM CLEAN prend en charge ce nettoyage pour livrer des locaux prêts à l’usage.',
    ],
    includes: [
      'Remise en état après construction ou rénovation',
      'Élimination des poussières, gravats et résidus de chantier',
      'Nettoyage fin des sols, menuiseries et vitrages',
      'Locaux livrés prêts à l’usage',
    ],
    forWhom: [
      'Promoteurs',
      'Entreprises du bâtiment',
      'Entreprises qui emménagent',
      'Copropriétés après travaux',
    ],
    howItWorks: [
      {
        title: 'Une évaluation sur place',
        text: 'Surface, état du chantier et volume à traiter sont évalués avant d’établir le devis.',
      },
      {
        title: 'Calée sur votre planning',
        text: 'L’intervention est programmée en fonction de votre date de livraison ou d’emménagement.',
      },
      {
        title: 'En une ou plusieurs étapes',
        text: 'Selon l’avancement des travaux, le nettoyage peut être réalisé en une fois ou en plusieurs passages, à définir ensemble.',
      },
    ],
    faq: [
      {
        question: 'Quand faut-il programmer le nettoyage de fin de chantier ?',
        answer:
          'En général une fois les corps de métier partis. Le moment exact est défini avec vous selon votre date de livraison.',
      },
      {
        question: 'Les gravats sont-ils pris en charge ?',
        answer:
          'L’élimination des poussières, gravats et résidus de chantier fait partie de la prestation. Le volume est évalué lors de la visite et précisé dans le devis.',
      },
    ],
    related: ['remise-en-etat-apres-sinistre', 'vitres-et-facades', 'nettoyage-industriel'],
  },
  {
    slug: 'remise-en-etat-apres-sinistre',
    h1: 'Remise en état après sinistre et nettoyage post-événement',
    metaTitle: 'Remise en état après sinistre : dégât des eaux, incendie',
    metaDescription:
      'Nettoyage et assèchement après dégât des eaux, remise en état des surfaces après incendie ou catastrophe naturelle, nettoyage après événement. Île-de-France.',
    photoBrief:
      'Une intervention réelle après dégât des eaux (matériel d’assèchement visible), sans information permettant d’identifier le client.',
    intro: [
      'Après un dégât des eaux, un incendie ou un événement, l’objectif est de retrouver rapidement des locaux propres et utilisables.',
      'GAM CLEAN intervient pour le nettoyage et la remise en état des surfaces concernées. Le plus simple est de nous appeler pour décrire la situation.',
    ],
    includes: [
      'Nettoyage et assèchement après dégât des eaux',
      'Remise en état des surfaces après incendie ou catastrophe naturelle',
      'Nettoyage après un événement',
      'Remise en état d’espaces naturels aménagés et de plages',
    ],
    forWhom: ['Entreprises', 'Commerces', 'Copropriétés', 'Collectivités'],
    howItWorks: [
      {
        title: 'Un premier échange par téléphone',
        text: 'Décrivez la situation : nature du sinistre, surfaces touchées, contraintes d’accès.',
      },
      {
        title: 'Une évaluation sur place',
        text: 'Les surfaces à traiter et les opérations nécessaires sont identifiées avec vous.',
      },
      {
        title: 'Un devis détaillé',
        text: 'Les opérations prévues sont détaillées avant l’intervention.',
      },
    ],
    faq: [
      {
        question: 'Que faire en cas de dégât des eaux ?',
        answer:
          'Appelez-nous directement pour décrire la situation : c’est le moyen le plus rapide d’organiser une intervention.',
        claimAddendum: 'availability247',
      },
    ],
    related: ['nettoyage-apres-travaux', 'commerces-et-erp', 'nettoyage-de-bureaux'],
  },
  {
    slug: 'prestations-specialisees',
    h1: 'Prestations de nettoyage spécialisées',
    metaTitle: 'Prestations de nettoyage spécialisées',
    metaDescription:
      'Zones sensibles et sols techniques, ventilation, piscines, voiries et déneigement, ramonage, citernes et véhicules : les prestations spécialisées de GAM CLEAN.',
    photoBrief:
      'Une photo par spécialité réellement pratiquée (salle technique, bassin, voirie…), prise lors d’une intervention GAM CLEAN.',
    intro: [
      'Au-delà de l’entretien courant, certains espaces et équipements demandent des techniques spécifiques. GAM CLEAN propose plusieurs prestations spécialisées, en intervention ponctuelle ou dans le cadre d’un contrat.',
      'Décrivez votre besoin : nous vous indiquerons comment il peut être pris en charge.',
    ],
    includes: [],
    forWhom: ['Laboratoires', 'Copropriétés', 'Hôtels et établissements de loisirs', 'Collectivités', 'Transporteurs'],
    groups: [
      {
        id: 'zones-sensibles',
        title: 'Zones sensibles et équipements techniques',
        icon: 'flask',
        points: [
          'Nettoyage de zones sensibles : laboratoires, salles blanches',
          'Décontamination et traitement des surfaces',
          'Entretien de sols techniques : résine, carrelage industriel',
          'Nettoyage de systèmes de ventilation et de climatisation',
        ],
      },
      {
        id: 'piscines',
        title: 'Piscines',
        icon: 'waves',
        points: [
          'Traitement et entretien des bassins, plages et locaux techniques',
          'Nettoyage des équipements filtrants et des margelles',
          'Pour les copropriétés, hôtels et établissements de loisirs',
        ],
      },
      {
        id: 'exterieurs-voiries',
        title: 'Espaces extérieurs et voiries',
        icon: 'road',
        points: [
          'Balayage, lavage et remise en état des chaussées et espaces communs extérieurs',
          'Déneigement et salage des accès, parkings et zones de circulation',
          'Nettoyage des caniveaux, cours intérieures et espaces attenants',
        ],
      },
      {
        id: 'cheminees-conduits',
        title: 'Cheminées et conduits',
        icon: 'flame',
        points: [
          'Ramonage et nettoyage des cheminées, âtres et conduits de fumée',
          'Dégagement et nettoyage des conduits de ventilation (colonnes)',
        ],
      },
      {
        id: 'transport-citernes',
        title: 'Matériels de transport et citernes',
        icon: 'truck',
        points: [
          'Nettoyage courant de véhicules de transport collectif : bus, navettes d’entreprise',
          'Nettoyage intérieur de citernes de transport routier',
          'Nettoyage de bouteilles et de contenants industriels',
        ],
      },
    ],
    howItWorks: [
      {
        title: 'Décrivez le besoin',
        text: 'Type d’équipement ou d’espace, contraintes d’accès, fréquence souhaitée.',
      },
      {
        title: 'Étude et visite',
        text: 'La faisabilité et la méthode sont étudiées, avec une visite si nécessaire.',
      },
      {
        title: 'Une proposition détaillée',
        text: 'Le devis précise les opérations prévues et leur organisation.',
      },
    ],
    faq: [
      {
        question: 'Mon besoin n’apparaît pas dans la liste. Pouvez-vous m’aider ?',
        answer:
          'Décrivez-le dans le formulaire de devis ou par téléphone : chaque demande est étudiée selon la nature de vos locaux et de vos équipements.',
      },
    ],
    related: ['nettoyage-industriel', 'vitres-et-facades', 'remise-en-etat-apres-sinistre'],
  },
]

export type Service = ServiceSummary & ServiceDetails

/** Prestations complètes, dans l'ordre de l'index. */
export const services: Service[] = serviceIndex.map((summary) => {
  const d = details.find((x) => x.slug === summary.slug)
  if (!d) throw new Error(`Détails manquants pour la prestation « ${summary.slug} »`)
  return { ...summary, ...d }
})

export const getService = (slug: string) => services.find((s) => s.slug === slug)
export const featuredServices = services.filter((s) => s.featured)
export const otherServices = services.filter((s) => !s.featured)
