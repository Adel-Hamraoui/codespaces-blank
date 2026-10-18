'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Phone } from 'lucide-react'
import styles from './MobileActionBar.module.css'

type Props = { phone: { href: string }; freeQuote: boolean }

/** Barre d'actions fixe sur mobile et tablette : appeler / demander un devis. */
export function MobileActionBar(props: Props) {
  return <MobileActionBarView {...props} pathname={usePathname()} />
}

export function MobileActionBarView({ phone, freeQuote, pathname }: Props & { pathname: string | null }) {
  const onQuotePage = pathname?.startsWith('/devis') ?? false

  return (
    <aside className={styles.bar} aria-label="Contact rapide">
      <a href={phone.href} className={`btn btn-secondary ${styles.action}`} data-track-location="barre-mobile">
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
          {freeQuote ? 'Devis gratuit' : 'Devis'}
        </Link>
      )}
    </aside>
  )
}
