import { Clock, FileText, Phone, Search } from 'lucide-react'
import { PageHero } from '@/components/sections/PageHero'
import { RequestForm } from '@/components/forms/RequestForm'
import { claims, company } from '@/content/site'
import { pageMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = pageMetadata({
  title: 'Demande de devis de nettoyage professionnel',
  description:
    'Décrivez vos locaux et la prestation souhaitée : GAM CLEAN vous recontacte pour une visite et un devis détaillé. Bureaux, commerces, industrie, vitres.',
  path: '/devis',
})

export default function DevisPage() {
  const steps = [
    { icon: FileText, title: 'Vous envoyez votre demande', text: 'Quelques informations sur vos locaux et vos besoins.' },
    {
      icon: Phone,
      title: 'Nous vous recontactons',
      text: company.responseTime
        ? `${company.responseTime.charAt(0).toUpperCase()}${company.responseTime.slice(1)}, pour préciser votre besoin.`
        : 'Par téléphone ou par e-mail, pour préciser votre besoin.',
    },
    { icon: Search, title: 'Visite de vos locaux', text: 'Pour évaluer les surfaces, les contraintes et vos attentes.' },
    {
      icon: Clock,
      title: 'Vous recevez le devis',
      text: claims.freeQuote.confirmed
        ? 'Détaillé, gratuit et sans engagement.'
        : 'Détaillé : prestations, fréquences et horaires.',
    },
  ]

  return (
    <>
      <PageHero
        crumbs={[{ name: 'Demande de devis', path: '/devis' }]}
        kicker={claims.freeQuote.confirmed ? claims.freeQuote.title : 'Devis'}
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
            <RequestForm type="devis" />
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
