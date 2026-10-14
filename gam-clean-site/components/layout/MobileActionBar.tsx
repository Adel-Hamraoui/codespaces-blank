'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Phone } from 'lucide-react'
import { claims, company } from '@/content/site'
import styles from './MobileActionBar.module.css'

/** Barre d'actions fixe sur mobile et tablette : appeler / demander un devis. */
export function MobileActionBar() {
  const pathname = usePathname()
  const onQuotePage = pathname.startsWith('/devis')

  return (
    <aside className={styles.bar} aria-label="Contact rapide">
      <a href={company.phone.href} className={`btn btn-secondary ${styles.action}`} data-track-location="barre-mobile">
        <Phone size={18} aria-hidden="true" />
        Appeler
      </a>
      {!onQuotePage && (
        <Link
          href="/devis"
          className={`btn ${styles.action}`}
          data-track="cta_devis_click"
          data-track-location="barre-mobile"
        >
          <FileText size={18} aria-hidden="true" />
          {claims.freeQuote.confirmed ? 'Devis gratuit' : 'Devis'}
        </Link>
      )}
    </aside>
  )
}
