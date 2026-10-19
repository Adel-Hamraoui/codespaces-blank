import Image from 'next/image'
import { BadgeCheck, CalendarClock, ExternalLink, FileText, Handshake } from 'lucide-react'
import { images } from '@/frontend/assets/images'
import { CtaBand } from '@/frontend/components/sections/CtaBand'
import { MethodSteps } from '@/frontend/components/sections/MethodSteps'
import { PageHero } from '@/frontend/components/sections/PageHero'
import { SectionHeading } from '@/frontend/components/ui/SectionHeading'
import { confirmedExtras, isConfirmed } from '@/frontend/lib/claims'
import { formatSiret } from '@/frontend/lib/format'
import type { SiteChrome } from '@/shared/types/content'
import styles from './AboutView.module.css'

export function AboutView({ chrome }: { chrome: SiteChrome }) {
  const { settings: company, claims } = chrome
  const siren = company.siret.slice(0, 9)
  const principles = [
    {
      icon: FileText,
      title: 'Des devis détaillés',
      text: 'Prestations, fréquences et horaires écrits noir sur blanc : vous savez ce que vous payez et ce qui est réalisé.',
    },
    {
      icon: Handshake,
      title: 'Un interlocuteur pour le suivi',
      text: 'Une personne de référence pour ajuster la prestation dans le temps, sans multiplier les contacts.',
    },
    {
      icon: CalendarClock,
      title: 'Une organisation adaptée à chaque site',
      text: 'Fréquences, créneaux et moyens sont choisis selon la réalité de vos locaux et de votre activité.',
    },
    ...confirmedExtras(claims).map((c) => ({ icon: BadgeCheck, title: c.title, text: c.body })),
  ]

  const legal: [string, string][] = [
    ['Raison sociale', company.legalName],
    ...(company.legalForm ? ([['Forme juridique', company.legalForm]] as [string, string][]) : []),
    ['SIRET', formatSiret(company.siret)],
    ...(company.vatNumber ? ([['N° de TVA intracommunautaire', company.vatNumber]] as [string, string][]) : []),
    ...(company.apeCode ? ([['Code APE', company.apeCode]] as [string, string][]) : []),
    ...(company.foundedYear ? ([['Création', String(company.foundedYear)]] as [string, string][]) : []),
    ['Implantation', `${company.address.city} (${company.address.postalCode}), ${company.address.department}`],
  ]

  return (
    <>
      <PageHero
        crumbs={[{ name: 'L’entreprise', path: '/a-propos' }]}
        kicker="L’entreprise"
        title={`${company.companyName}, le nettoyage professionnel organisé avec méthode`}
        lead={
          <p>
            Entreprise de nettoyage basée à {company.address.city}, en {company.address.department}, {company.companyName}
            accompagne entreprises, commerces, sites industriels et copropriétés d’{company.address.region}.
          </p>
        }
      />

      <section className="section" aria-labelledby="approche">
        <div className={`container ${styles.intro}`}>
          <div>
            <SectionHeading id="approche" kicker="Notre approche" title="Vous laisser vous concentrer sur votre activité" />
            <div className={styles.text}>
              <p>
                {company.companyName} prend en charge l’entretien, le nettoyage et la remise en état des espaces professionnels :
                bureaux, commerces, ateliers, entrepôts, parties communes, vitres et façades.
              </p>
              <p>
                Chaque prestation repose sur une méthode structurée plutôt que sur une intervention improvisée : visite
                des locaux, proposition détaillée, mise en place selon un cahier des charges écrit, puis ajustements dans
                le temps.
              </p>
              <p>
                Nous intervenons aussi bien pour un besoin ponctuel (fin de chantier, remise en état après sinistre,
                vitres) que dans le cadre d’un contrat d’entretien régulier.
              </p>
            </div>
          </div>
          <div className={styles.photo}>
            <Image
              src={images['point-de-suivi']}
              alt="Une responsable d’équipe d’entretien échange avec un client dans les locaux"
              sizes="(min-width: 1024px) 40vw, 100vw"
              placeholder="blur"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <section className="section bg-mist" aria-labelledby="principes">
        <div className="container">
          <SectionHeading id="principes" kicker="Notre façon de travailler" title="Des principes simples et vérifiables" />
          <ul className="grid grid-3 list-reset">
            {principles.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card reveal">
                <span className="card-icon">
                  <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-navy on-dark" aria-labelledby="methode-titre" id="methode">
        <div className="container">
          <SectionHeading
            id="methode-titre"
            kicker="Méthode"
            title="De la première demande au suivi de la prestation"
          />
          <MethodSteps />
        </div>
      </section>

      <section className="section" aria-labelledby="identite">
        <div className={`container ${styles.legal}`}>
          <div>
            <SectionHeading
              id="identite"
              kicker="Transparence"
              title="Une entreprise identifiée"
              lead="Nos informations légales sont publiques : vous pouvez les vérifier sur l’annuaire officiel des entreprises."
            />
            <a
              href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${siren}`}
              className="link-arrow"
              target="_blank"
              rel="noopener noreferrer"
            >
              Voir la fiche sur l’Annuaire des entreprises <ExternalLink size={16} aria-hidden="true" />
              <span className="sr-only">(nouvel onglet)</span>
            </a>
          </div>
          <dl className={styles.dl}>
            {legal.map(([k, v]) => (
              <div key={k} className={styles.dlRow}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <CtaBand
        location="a-propos-final"
        phone={company.phone}
        email={company.email}
        freeQuote={isConfirmed(claims, 'freeQuote')}
      />
    </>
  )
}
