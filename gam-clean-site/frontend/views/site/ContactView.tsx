import Link from 'next/link'
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { RequestForm } from '@/frontend/components/forms/RequestForm'
import { PageHero } from '@/frontend/components/sections/PageHero'
import type { SiteChrome } from '@/shared/types/content'
import styles from './ContactView.module.css'

export function ContactView({ chrome }: { chrome: SiteChrome }) {
  const { settings: company } = chrome
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Contact', path: '/contact' }]}
        kicker="Contact"
        title={`Contacter ${company.companyName}`}
        lead={<p>Une question, un besoin à préciser ? Appelez-nous, écrivez-nous ou laissez un message ci-dessous.</p>}
      />

      <section className="section" aria-label="Coordonnées et formulaire">
        <div className={`container ${styles.layout}`}>
          <div className={styles.channels}>
            <a href={company.phone.href} className={styles.channel} data-track-location="contact-carte">
              <span className={styles.channelIcon}>
                <Phone size={22} aria-hidden="true" />
              </span>
              <span>
                <span className={styles.channelLabel}>Téléphone</span>
                <span className={styles.channelValue}>{company.phone.display}</span>
              </span>
            </a>
            <a href={`mailto:${company.email}`} className={styles.channel} data-track-location="contact-carte">
              <span className={styles.channelIcon}>
                <Mail size={22} aria-hidden="true" />
              </span>
              <span>
                <span className={styles.channelLabel}>E-mail</span>
                <span className={styles.channelValue}>{company.email}</span>
              </span>
            </a>
            <div className={styles.channel}>
              <span className={styles.channelIcon}>
                <MapPin size={22} aria-hidden="true" />
              </span>
              <span>
                <span className={styles.channelLabel}>Implantation</span>
                <span className={styles.channelValue}>
                  {company.address.street ? `${company.address.street}, ` : ''}
                  {company.address.postalCode} {company.address.city}
                </span>
                <span className={styles.channelNote}>Intervention dans toute l’{company.address.region}</span>
              </span>
            </div>
            {company.openingHours && (
              <div className={styles.channel}>
                <span className={styles.channelIcon}>
                  <Clock size={22} aria-hidden="true" />
                </span>
                <span>
                  <span className={styles.channelLabel}>Horaires</span>
                  {company.openingHours.map((h) => (
                    <span key={h.days} className={styles.channelValue}>
                      {h.days} : {h.hours}
                    </span>
                  ))}
                </span>
              </div>
            )}

            <div className={styles.quoteBox}>
              <p className={styles.quoteTitle}>Besoin d’un devis ?</p>
              <p>Le formulaire de devis permet de décrire précisément vos locaux et la prestation souhaitée.</p>
              <Link href="/devis" className="btn btn-block" data-track="cta_devis_click" data-track-location="contact">
                Demander un devis <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Envoyer un message</h2>
            <RequestForm type="contact" services={[]} contact={{ phone: company.phone, email: company.email }} />
          </div>
        </div>
      </section>
    </>
  )
}
