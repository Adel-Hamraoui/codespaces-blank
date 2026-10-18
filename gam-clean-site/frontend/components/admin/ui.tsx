// ============================================================================
// Composants d'affichage du back-office (sans état, utilisables partout).
// ============================================================================
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, CircleAlert, CircleCheck, Info, Inbox } from 'lucide-react'
import { LEAD_STATUSES, REVIEW_STATUSES, labelOf, type LeadStatus, type ReviewStatus, type Tone } from '@/shared/constants'
import styles from './admin.module.css'

export { styles as adminStyles }

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  back?: { href: string; label: string }
  actions?: ReactNode
}) {
  return (
    <header className={styles.pageHead}>
      <div>
        {back && (
          <Link href={back.href} className={styles.crumb}>
            <ArrowLeft size={16} aria-hidden="true" /> {back.label}
          </Link>
        )}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className={styles.headActions}>{actions}</div>}
    </header>
  )
}

export function Panel({
  title,
  description,
  actions,
  children,
  id,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  id?: string
}) {
  // Nom accessible de la région : son titre (les panneaux sans titre restent de simples blocs).
  return (
    <section className={styles.panel} aria-label={typeof title === 'string' ? title : undefined} id={id}>
      {(title || actions) && (
        <div className={styles.panelHead}>
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`${styles.badge} ${styles[`tone-${tone}`]}`}>{children}</span>
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const tone = LEAD_STATUSES.find((s) => s.value === status)?.tone ?? 'neutral'
  return <Badge tone={tone}>{labelOf(LEAD_STATUSES, status)}</Badge>
}

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const tone = REVIEW_STATUSES.find((s) => s.value === status)?.tone ?? 'neutral'
  return <Badge tone={tone}>{labelOf(REVIEW_STATUSES, status)}</Badge>
}

export function Flash({ tone, children }: { tone: 'ok' | 'error' | 'info'; children: ReactNode }) {
  const Icon = tone === 'ok' ? CircleCheck : tone === 'error' ? CircleAlert : Info
  const cls = tone === 'ok' ? styles.flashOk : tone === 'error' ? styles.flashError : styles.flashInfo
  return (
    <p className={`${styles.flash} ${cls}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

export function EmptyState({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className={styles.empty}>
      {icon ?? <Inbox size={40} aria-hidden="true" />}
      <strong>{title}</strong>
      {children && <div>{children}</div>}
    </div>
  )
}

export function Stat({
  label,
  value,
  note,
  href,
}: {
  label: string
  value: ReactNode
  note?: ReactNode
  href?: string
}) {
  const body = (
    <>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      {note && <span className={styles.statNote}>{note}</span>}
    </>
  )
  return href ? (
    <Link href={href} className={styles.stat}>
      {body}
    </Link>
  ) : (
    <div className={styles.stat}>{body}</div>
  )
}
