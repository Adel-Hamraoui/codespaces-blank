// ============================================================================
// SECTEURS D'INTERVENTION — repris du site actuel, reformulés.
// ============================================================================
import type { IconName } from './service-index'

export type Sector = {
  id: string
  name: string
  icon: IconName
  challenge: string
  approach: string
  examples: string[]
  services: string[] // slugs de prestations liées
}

export const sectors: Sector[] = [
  {
    id: 'entreprises',
    name: 'Entreprises et bureaux',
    icon: 'building',
    challenge:
      'Un environnement de travail propre et accueillant au quotidien, sans perturber l’activité des équipes.',
    approach:
      'Des créneaux adaptés à votre organisation et un plan d’entretien complet des espaces de travail.',
    examples: ['Bureaux et open spaces', 'Salles de réunion', 'Sanitaires et espaces d’accueil', 'Sièges sociaux et agences'],
    services: ['nettoyage-de-bureaux', 'vitres-et-facades'],
  },
  {
    id: 'commerces',
    name: 'Commerces et ERP',
    icon: 'store',
    challenge:
      'Des espaces qui accueillent du public et doivent être impeccables en permanence, sans gêner l’exploitation.',
    approach:
      'Des interventions en dehors ou en marge des horaires d’ouverture, avec une attention particulière aux zones de circulation.',
    examples: ['Boutiques et centres commerciaux', 'Hôtels', 'Restaurants', 'Vitrines et surfaces de vente'],
    services: ['commerces-et-erp', 'vitres-et-facades'],
  },
  {
    id: 'industrie',
    name: 'Industrie et logistique',
    icon: 'factory',
    challenge:
      'Ateliers, entrepôts et zones logistiques exigent des méthodes rigoureuses et le respect des consignes de sécurité.',
    approach:
      'Des méthodes et du matériel adaptés aux environnements industriels, définis après une visite du site.',
    examples: ['Ateliers de production', 'Entrepôts', 'Zones logistiques', 'Machines et équipements'],
    services: ['nettoyage-industriel', 'prestations-specialisees'],
  },
  {
    id: 'coproprietes',
    name: 'Copropriétés',
    icon: 'city',
    challenge:
      'Des parties communes propres et sûres pour tous les résidents, avec une continuité de service.',
    approach:
      'Un entretien régulier des parties communes et un interlocuteur pour le syndic ou le conseil syndical.',
    examples: ['Halls et escaliers', 'Parkings et locaux techniques', 'Cheminées et conduits', 'Espaces extérieurs'],
    services: ['vitres-et-facades', 'prestations-specialisees'],
  },
  {
    id: 'collectivites',
    name: 'Collectivités',
    icon: 'landmark',
    challenge:
      'Bâtiments administratifs, écoles et équipements publics ont besoin d’un entretien fiable et régulier.',
    approach:
      'Des interventions programmées selon les horaires des services et la fréquentation de chaque bâtiment.',
    examples: ['Mairies et bâtiments administratifs', 'Écoles et gymnases', 'Espaces extérieurs et voiries', 'Interventions hors présence du public'],
    services: ['nettoyage-de-bureaux', 'prestations-specialisees'],
  },
  {
    id: 'sante',
    name: 'Santé',
    icon: 'medical',
    challenge:
      'Les établissements de santé imposent des exigences d’hygiène renforcées et une grande rigueur.',
    approach:
      'Des protocoles d’entretien et de désinfection adaptés aux environnements sensibles.',
    examples: ['Cabinets médicaux', 'Laboratoires', 'Désinfection des points de contact', 'Zones sensibles'],
    services: ['prestations-specialisees', 'nettoyage-de-bureaux'],
  },
]
