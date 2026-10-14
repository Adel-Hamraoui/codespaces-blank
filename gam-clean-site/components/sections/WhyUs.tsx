import { CalendarClock, ClipboardCheck, Layers, MapPin, Repeat, FileCheck2, BadgeCheck } from 'lucide-react'
import { claims, company, type ClaimKey } from '@/content/site'
import styles from './WhyUs.module.css'

const formatSiret = (s: string) => s.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1 $2 $3 $4')

/**
 * Arguments de différenciation.
 * Les quatre premiers découlent de l'offre et de la méthode décrites par GAM CLEAN ;
 * les affirmations de content/site.ts s'ajoutent seulement si elles sont confirmées.
 */
export function WhyUs() {
  const base = [
    {
      icon: Layers,
      title: 'Un interlocuteur pour tous vos besoins',
      text: 'Entretien courant, vitres, fin de chantier, remise en état, prestations techniques : un seul prestataire au lieu de plusieurs.',
    },
    {
      icon: ClipboardCheck,
      title: 'Un devis construit sur place',
      text: 'Une visite de vos locaux avant toute proposition : le devis correspond à vos surfaces et à vos contraintes réelles.',
    },
    {
      icon: CalendarClock,
      title: 'Des horaires qui s’adaptent à vous',
      text: 'Tôt le matin, en soirée ou hors ouverture au public : l’entretien se fait sans gêner votre activité.',
    },
    {
      icon: Repeat,
      title: 'Ponctuel ou récurrent',
      text: 'Une intervention unique, ou un contrat d’entretien avec une fréquence définie ensemble.',
    },
    {
      icon: MapPin,
      title: 'Une entreprise de proximité',
      text: `Basée à ${company.address.city}, en ${company.address.department}, GAM CLEAN intervient dans toute l’${company.address.region}.`,
    },
    {
      icon: FileCheck2,
      title: 'Une entreprise identifiée',
      text: `SIRET ${formatSiret(company.siret)} · TVA ${company.vatNumber}. Les informations légales sont publiques et consultables.`,
    },
  ]

  const confirmedKeys = (Object.keys(claims) as ClaimKey[]).filter(
    (k) => k !== 'freeQuote' && claims[k].confirmed
  )
  const extra = confirmedKeys.map((k) => ({ icon: BadgeCheck, title: claims[k].title, text: claims[k].text }))

  return (
    <ul className={styles.grid}>
      {[...base, ...extra].map(({ icon: Icon, title, text }) => (
        <li key={title} className={styles.item}>
          <span className={styles.icon}>
            <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className={styles.title}>{title}</h3>
          <p>{text}</p>
        </li>
      ))}
    </ul>
  )
}
