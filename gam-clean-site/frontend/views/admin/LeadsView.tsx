import Link from 'next/link'
import { Download, Search } from 'lucide-react'
import { EmptyState, Flash, PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'
import { LEAD_STATUSES, LEAD_TYPES, type LeadStatus } from '@/shared/constants'
import type { LeadFilters, LeadListItem, Page } from '@/shared/types/admin'
import { filtersToQuery } from '@/shared/validation/filters'
import { LeadsTable } from './shared'

type Props = {
  page: Page<LeadListItem>
  filters: LeadFilters
  /** Curseur de la page affichée (null = première page). */
  cursor: string | null
  counts: Record<LeadStatus, number>
  services: { id: number; name: string }[]
  assignees: { id: number; displayName: string }[]
  now: number
  notice: 'supprimee' | 'erreur' | null
}

export function LeadsView({ page, filters, cursor, counts, services, assignees, now, notice }: Props) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const tabs = [{ value: undefined, label: 'Toutes', count: total }, ...LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts[s.value] }))]
  const secondary = [filters.type, filters.serviceId, filters.assignedToId, filters.from, filters.to].filter(Boolean).length
  const hasFilters = secondary > 0 || Boolean(filters.q)

  return (
    <>
      <PageHeader
        title="Demandes"
        description="Demandes de devis et messages reçus par le site."
        actions={
          <a
            href={`/api/admin/export/demandes${filtersToQuery(filters)}`}
            className={`${styles.btn} ${styles.btnSecondary}`}
            download
          >
            <Download size={16} aria-hidden="true" /> Exporter (CSV)
          </a>
        }
      />
      {notice === 'supprimee' && <Flash tone="ok">Demande supprimée définitivement.</Flash>}
      {notice === 'erreur' && <Flash tone="error">Suppression impossible avec votre compte.</Flash>}

      <nav aria-label="Filtrer par statut">
        <ul className={styles.tabs}>
          {tabs.map((t) => (
            <li key={t.label}>
              <Link
                href={`/admin/demandes${filtersToQuery({ ...filters, status: t.value })}`}
                className={styles.tab}
                aria-current={filters.status === t.value ? 'page' : undefined}
              >
                {t.label} <span className={styles.tabCount}>{t.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Panel>
        <form method="get" action="/admin/demandes" role="search">
          {filters.status && <input type="hidden" name="statut" value={filters.status} />}
          <div className={`${styles.form} ${styles.searchRow}`}>
            <div className={styles.field}>
              <label htmlFor="f-q" className={styles.label}>
                Rechercher
              </label>
              <input id="f-q" type="search" name="q" defaultValue={filters.q ?? ''} placeholder="Nom, e-mail, société, ville, téléphone…" />
            </div>
            <button type="submit" className={styles.btn}>
              <Search size={16} aria-hidden="true" /> Filtrer
            </button>
            {hasFilters && (
              <Link href={`/admin/demandes${filtersToQuery({ status: filters.status })}`} className={`${styles.btn} ${styles.btnSecondary}`}>
                Effacer
              </Link>
            )}
          </div>
          {/* Filtres secondaires repliés (ouverts dès que l'un d'eux est actif). */}
          <details className={styles.moreFilters} open={secondary > 0 || undefined}>
            <summary>
              Plus de filtres{secondary > 0 && <span className={styles.activeCount}>{secondary}</span>}
            </summary>
            <div className={`${styles.form} ${styles.filters}`}>
              <div className={styles.field}>
                <label htmlFor="f-type" className={styles.label}>
                  Type
                </label>
                <select id="f-type" name="type" defaultValue={filters.type ?? ''}>
                  <option value="">Tous</option>
                  {LEAD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="f-service" className={styles.label}>
                  Prestation
                </label>
                <select id="f-service" name="prestation" defaultValue={filters.serviceId ?? ''}>
                  <option value="">Toutes</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="f-assignee" className={styles.label}>
                  Suivi par
                </label>
                <select id="f-assignee" name="assigne" defaultValue={filters.assignedToId ?? ''}>
                  <option value="">Tout le monde</option>
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="f-from" className={styles.label}>
                  Du
                </label>
                <input id="f-from" type="date" name="du" defaultValue={filters.from ?? ''} />
              </div>
              <div className={styles.field}>
                <label htmlFor="f-to" className={styles.label}>
                  Au
                </label>
                <input id="f-to" type="date" name="au" defaultValue={filters.to ?? ''} />
              </div>
            </div>
          </details>
        </form>

        {page.items.length > 0 ? (
          <LeadsTable items={page.items} now={now} />
        ) : (
          <EmptyState title={hasFilters || filters.status ? 'Aucune demande ne correspond' : 'Aucune demande pour le moment'}>
            {hasFilters ? 'Modifiez ou effacez les filtres.' : 'Les demandes envoyées depuis le site apparaîtront ici.'}
          </EmptyState>
        )}

        {(cursor || page.nextCursor) && (
          <div className={styles.pager}>
            {cursor ? <Link href={`/admin/demandes${filtersToQuery(filters)}`}>← Revenir aux plus récentes</Link> : <span />}
            {page.nextCursor && (
              <Link
                href={`/admin/demandes${filtersToQuery(filters, { apres: page.nextCursor })}`}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Demandes plus anciennes →
              </Link>
            )}
          </div>
        )}
      </Panel>
    </>
  )
}
