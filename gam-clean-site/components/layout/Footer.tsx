import Image from 'next/image'
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import logoDark from '@/assets/brand/logo-dark.png'
import { company } from '@/content/site'
import { serviceIndex as services } from '@/content/service-index'
import { legalNav, mainNav } from '@/content/navigation'
import styles from './Footer.module.css'

const formatSiret = (s: string) => s.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1 $2 $3 $4')

export function Footer() {
  return (
    <footer className={`${styles.footer} on-dark`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.about}>
          <Image src={logoDark} alt={company.name} className={styles.logo} sizes="200px" />
          <p>
            Entreprise de nettoyage professionnel basée à {company.address.city} ({company.address.departmentCode}).
            Entretien de locaux, vitres, fin de chantier et remise en état en {company.address.region}.
          </p>
          <Link href="/devis" className="btn btn-on-dark" data-track="cta_devis_click" data-track-location="footer">
            Demander un devis
          </Link>
        </div>

        <nav aria-labelledby="footer-prestations">
          <h2 id="footer-prestations" className={styles.title}>
            Prestations
          </h2>
          <ul className={styles.list}>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/prestations/${s.slug}`}>{s.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-entreprise">
          <h2 id="footer-entreprise" className={styles.title}>
            GAM CLEAN
          </h2>
          <ul className={styles.list}>
            <li>
              <Link href="/prestations">Toutes les prestations</Link>
            </li>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/devis">Demande de devis</Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className={styles.title}>Contact</h2>
          <ul className={styles.contact}>
            <li>
              <Phone size={18} aria-hidden="true" />
              <a href={company.phone.href} data-track-location="footer">
                {company.phone.display}
              </a>
            </li>
            <li>
              <Mail size={18} aria-hidden="true" />
              <a href={`mailto:${company.email}`} data-track-location="footer">
                {company.email}
              </a>
            </li>
            <li>
              <MapPin size={18} aria-hidden="true" />
              <span>
                {company.address.city} ({company.address.postalCode})
                <br />
                Intervention en {company.address.region}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p>
            © {new Date().getFullYear()} {company.legalName} · SIRET {formatSiret(company.siret)}
          </p>
          <ul className={styles.legal}>
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
