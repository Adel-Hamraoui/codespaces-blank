import type { ReactNode } from 'react'
import { Breadcrumbs, type Crumb } from '@/frontend/components/ui/Breadcrumbs'
import { Sparkle } from '@/frontend/components/ui/Sparkle'
import styles from './PageHero.module.css'

type Props = {
  /** Fil d’Ariane (absent sur les pages non indexées hors arborescence). */
  crumbs?: Crumb[]
  kicker?: string
  title: string
  lead?: ReactNode
  children?: ReactNode
  /** Visuel optionnel à droite (image ou PhotoSlot). */
  aside?: ReactNode
}

/** En-tête des pages intérieures : fil d'Ariane, H1 unique, introduction. */
export function PageHero({ crumbs, kicker, title, lead, children, aside }: Props) {
  return (
    <section className={styles.hero}>
      <div className={`container ${aside ? styles.withAside : ''}`}>
        <div className={styles.copy}>
          {crumbs && <Breadcrumbs items={crumbs} />}
          {kicker && (
            <p className="kicker">
              <Sparkle size={11} />
              {kicker}
            </p>
          )}
          <h1 className={styles.title}>{title}</h1>
          {lead && <div className={styles.lead}>{lead}</div>}
          {children && <div className={styles.actions}>{children}</div>}
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>
    </section>
  )
}
