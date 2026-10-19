// Éléments communs aux écrans de demandes (liste, fiche, tableau de bord).
import Link from 'next/link'
import { MailWarning } from 'lucide-react'
import { LeadStatusBadge, adminStyles as styles } from '@/frontend/components/admin/ui'
import { formatDateTime, formatRelative } from '@/frontend/lib/format'
import { LEAD_TYPES, labelOf } from '@/shared/constants'
import type { LeadListItem } from '@/shared/types/admin'
import { formatPhone } from '@/shared/validation/common'

/** Tableau des demandes ; « compact » retire les colonnes Lieu et Suivi par (tableau de bord). */
export function LeadsTable({ items, now, compact = false }: { items: LeadListItem[]; now: number; compact?: boolean }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Reçue</th>
            <th scope="col">Contact</th>
            <th scope="col">Demande</th>
            {!compact && <th scope="col">Lieu</th>}
            <th scope="col">Statut</th>
            {!compact && <th scope="col">Suivi par</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id} className={styles.clickable}>
              <td data-label="Reçue" className={styles.nowrap}>
                <time dateTime={l.createdAt} title={formatDateTime(l.createdAt)}>
                  {formatRelative(l.createdAt, now)}
                </time>
                <span className={styles.sub}>n° {l.id}</span>
              </td>
              <td data-label="Contact">
                <Link href={`/admin/demandes/${l.id}`} className={styles.rowLink}>
                  {l.name}
                </Link>
                <span className={styles.sub}>{l.company ?? l.email}</span>
                {l.phone && <span className={styles.sub}>{formatPhone(l.phone)}</span>}
              </td>
              <td data-label="Demande">
                <span>{labelOf(LEAD_TYPES, l.type)}</span>
                {!l.notified && (
                  <MailWarning size={16} className={styles.warnIcon} aria-label="Notification e-mail non envoyée" />
                )}
                <span className={styles.sub}>
                  {[...l.serviceNames, ...(l.otherNeed ? ['Autre besoin'] : [])].join(', ') || '—'}
                </span>
              </td>
              {!compact && <td data-label="Lieu">{l.location ?? '—'}</td>}
              <td data-label="Statut">
                <LeadStatusBadge status={l.status} />
              </td>
              {!compact && (
                <td data-label="Suivi par">{l.assignedTo ?? <span className={styles.muted}>Personne</span>}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
