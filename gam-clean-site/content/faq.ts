// ============================================================================
// FAQ — les réponses s'adaptent automatiquement aux informations confirmées
// dans content/site.ts (aucune promesse non confirmée n'est publiée).
// ============================================================================
import { claims, company } from './site'

export type FaqItem = { question: string; answer: string }

const sentence = (base: string, extra?: string | false | null) => (extra ? `${base} ${extra}` : base)

export function getFaq(): FaqItem[] {
  const items: (FaqItem | null)[] = [
    {
      question: 'Quels types de locaux nettoyez-vous ?',
      answer:
        'Bureaux, commerces et établissements recevant du public, sites industriels et logistiques, copropriétés, bâtiments de collectivités et établissements de santé. Nous réalisons aussi des prestations spécialisées : vitres en hauteur, fin de chantier, remise en état après sinistre, piscines, voiries, conduits.',
    },
    {
      question: 'Dans quelles zones intervenez-vous ?',
      answer: `Nous sommes basés à ${company.address.city} (${company.address.departmentCode}) et intervenons en ${company.address.department} et dans toute l’${company.address.region}.`,
    },
    {
      question: 'Proposez-vous des interventions ponctuelles ?',
      answer:
        'Oui : nettoyage de fin de chantier, remise en état, vitres, nettoyage après un événement… Une intervention ponctuelle peut aussi précéder un contrat régulier.',
    },
    {
      question: 'Proposez-vous des contrats d’entretien réguliers ?',
      answer:
        'Oui. La fréquence (quotidienne, plusieurs fois par semaine, hebdomadaire, mensuelle) et les horaires sont définis selon vos besoins.',
    },
    {
      question: 'Comment se passe une demande de devis ?',
      answer:
        'Vous décrivez votre besoin via le formulaire ou par téléphone. Nous organisons ensuite une visite de vos locaux pour évaluer les surfaces et vos contraintes, puis nous vous adressons un devis détaillé.',
    },
    claims.freeQuote.confirmed
      ? {
          question: 'Le devis est-il gratuit ?',
          answer: 'Oui, le devis est gratuit et sans engagement : vous restez entièrement libre de votre décision.',
        }
      : null,
    company.responseTime
      ? {
          question: 'Sous quel délai répondez-vous ?',
          answer: `Nous répondons aux demandes ${company.responseTime}.`,
        }
      : null,
    {
      question: 'Pouvez-vous intervenir en dehors des horaires de bureau ?',
      answer: sentence(
        'Oui. Les créneaux sont adaptés à vos contraintes : tôt le matin, en soirée ou à un autre moment convenu ensemble.',
        claims.availability247.confirmed && 'Nous sommes joignables 7j/7 et 24h/24.'
      ),
    },
    {
      question: 'Fournissez-vous le matériel et les produits ?',
      answer: sentence(
        'Oui, nous intervenons avec notre propre matériel professionnel et des produits adaptés à chaque type de surface.',
        claims.ecoProducts.confirmed && 'Nous privilégions des produits éco-responsables.'
      ),
    },
    {
      question: 'Intervenez-vous en hauteur ?',
      answer: sentence(
        'Oui, pour le nettoyage de vitres et de façades. La méthode d’accès est déterminée après étude du bâtiment.',
        claims.qualifiedRopeAccess.confirmed && 'Ces travaux sont réalisés par des cordistes qualifiés.'
      ),
    },
    claims.insurance.confirmed
      ? {
          question: 'Êtes-vous assurés ?',
          answer:
            'Oui, GAM CLEAN dispose d’une assurance responsabilité civile professionnelle. L’attestation est disponible sur demande.',
        }
      : null,
    {
      question: 'Comment la qualité est-elle suivie dans le temps ?',
      answer:
        'Le cahier des charges validé ensemble sert de référence. La prestation est ajustée selon vos retours et l’évolution de vos besoins.',
    },
    {
      question: 'Que faire en cas d’urgence (dégât des eaux, sinistre) ?',
      answer: sentence(
        `Appelez-nous directement au ${company.phone.display} pour décrire la situation : c’est le moyen le plus rapide d’organiser une intervention.`,
        claims.availability247.confirmed && 'Nous sommes joignables 7j/7 et 24h/24.'
      ),
    },
  ]
  return items.filter((i): i is FaqItem => i !== null)
}
