import Link from 'next/link'
import { BadgeCheck, Building2, HelpCircle, Layers, Shapes } from 'lucide-react'
import { PageHeader, adminStyles as styles } from '@/frontend/components/admin/ui'

type Props = { counts: { services: number; faq: number; sectors: number; claimsConfirmed: number; claims: number } }

export function ContentHubView({ counts }: Props) {
  const cards = [
    { href: '/admin/contenu/coordonnees', icon: Building2, title: 'Entreprise et coordonnées', text: 'Téléphone, e-mail, adresse, zone d’intervention, mentions légales.' },
    { href: '/admin/contenu/affirmations', icon: BadgeCheck, title: 'Affirmations commerciales', text: `${counts.claimsConfirmed} confirmée(s) sur ${counts.claims}. Seules les affirmations prouvées sont publiées.` },
    { href: '/admin/contenu/prestations', icon: Layers, title: 'Prestations', text: `${counts.services} prestation(s) : textes, photos, référencement.` },
    { href: '/admin/contenu/faq', icon: HelpCircle, title: 'Questions fréquentes', text: `${counts.faq} question(s), générales ou propres à une prestation.` },
    { href: '/admin/contenu/secteurs', icon: Shapes, title: 'Secteurs d’intervention', text: `${counts.sectors} secteur(s) présentés sur la page « Secteurs ».` },
  ]
  return (
    <>
      <PageHeader
        title="Contenu du site"
        description="Chaque enregistrement est publié immédiatement sur le site (pages régénérées automatiquement)."
      />
      <div className={styles.cards}>
        {cards.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className={styles.cardLink}>
            <strong>
              <Icon size={20} aria-hidden="true" /> {title}
            </strong>
            <span>{text}</span>
          </Link>
        ))}
      </div>
    </>
  )
}
