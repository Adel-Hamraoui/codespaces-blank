import { CalendarClock, ClipboardCheck, Layers, MapPin, Repeat, FileCheck2, BadgeCheck } from 'lucide-react'
import { confirmedExtras } from '@/frontend/lib/claims'
import { formatSiret } from '@/frontend/lib/format'
import type { Claim, SiteSettings } from '@/shared/types/content'
import styles from './WhyUs.module.css'

/**
 * Arguments de différenciation.
 * Les six premiers découlent de l'offre et de la méthode décrites par GAM CLEAN ;
 * les affirmations commerciales s'ajoutent seulement si elles sont confirmées
 * dans le back-office.
 */
export function WhyUs({ settings: company, claims }: { settings: SiteSettings; claims: Claim[] }) {
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
      text: `Basée à ${company.address.city}, en ${company.address.department}, ${company.companyName} intervient dans toute l’${company.address.region}.`,
    },
    {
      icon: FileCheck2,
      title: 'Une entreprise identifiée',
      text: `SIRET ${formatSiret(company.siret)}${company.vatNumber ? ` · TVA ${company.vatNumber}` : ''}. Les informations légales sont publiques et consultables.`,
    },
  ]

  const extra = confirmedExtras(claims).map((c) => ({ icon: BadgeCheck, title: c.title, text: c.body }))

  return (
    <ul className={styles.grid}>
      {[...base, ...extra].map(({ icon: Icon, title, text }) => (
        <li key={title} className={`${styles.item} reveal`}>
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
