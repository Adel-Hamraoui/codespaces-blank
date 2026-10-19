import { Clock, FileText, Phone, Search } from 'lucide-react'
import { RequestForm } from '@/frontend/components/forms/RequestForm'
import { PageHero } from '@/frontend/components/sections/PageHero'
import { isConfirmed } from '@/frontend/lib/claims'
import { capitalize } from '@/frontend/lib/format'
import type { SiteChrome } from '@/shared/types/content'
import styles from './QuoteView.module.css'

export function QuoteView({ chrome }: { chrome: SiteChrome }) {
  const { settings: company, claims, services } = chrome
  const freeQuote = isConfirmed(claims, 'freeQuote')
  const steps = [
    { icon: FileText, title: 'Vous envoyez votre demande', text: 'Quelques informations sur vos locaux et vos besoins.' },
    {
      icon: Phone,
      title: 'Nous vous recontactons',
      text: company.responseTime
        ? `${capitalize(company.responseTime)}, pour préciser votre besoin.`
        : 'Par téléphone ou par e-mail, pour préciser votre besoin.',
    },
    { icon: Search, title: 'Visite de vos locaux', text: 'Pour évaluer les surfaces, les contraintes et vos attentes.' },
    {
      icon: Clock,
      title: 'Vous recevez le devis',
      text: freeQuote
        ? 'Détaillé, gratuit et sans engagement.'
        : 'Détaillé : prestations, fréquences et horaires.',
    },
  ]

  return (
    <>
      <PageHero
        crumbs={[{ name: 'Demande de devis', path: '/devis' }]}
        kicker={freeQuote ? 'Devis gratuit et sans engagement' : 'Devis'}
        title="Demander un devis"
        lead={
          <p>
            Dites-nous ce dont vous avez besoin. Nous revenons vers vous pour organiser une visite de vos locaux, puis
            nous vous adressons une proposition détaillée.
          </p>
        }
      />

      <section className="section" aria-label="Formulaire de demande de devis">
        <div className={`container ${styles.layout}`}>
          <div className={styles.formCard} id="formulaire">
            <RequestForm
              type="devis"
              services={services.map(({ slug, name }) => ({ slug, name }))}
              contact={{ phone: company.phone, email: company.email }}
            />
          </div>

          <aside className={styles.aside} aria-labelledby="apres-envoi">
            <h2 id="apres-envoi" className={styles.asideTitle}>
              Après votre demande
            </h2>
            <ol className={styles.steps}>
              {steps.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <span className={styles.stepIcon}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className={styles.stepTitle}>{title}</p>
                    <p className={styles.stepText}>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className={`${styles.call} on-dark`}>
              <p className={styles.callTitle}>Une question avant de remplir le formulaire ?</p>
              <a href={company.phone.href} className="btn btn-on-dark btn-block" data-track-location="devis-aside">
                <Phone size={18} aria-hidden="true" /> {company.phone.display}
              </a>
              <a href={`mailto:${company.email}`} className={styles.mail} data-track-location="devis-aside">
                {company.email}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
