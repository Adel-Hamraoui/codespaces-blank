import Link from 'next/link'
import { EmptyState, PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'
import { formatDateTime } from '@/frontend/lib/format'
import type { AuditEntry } from '@/shared/types/admin'

const ACTIONS: Record<string, string> = {
  'auth.login': 'Connexion',
  'auth.login_failed': 'Échec de connexion',
  'auth.password_change': 'Changement de mot de passe',
  'lead.status': 'Statut d’une demande',
  'lead.assign': 'Assignation d’une demande',
  'lead.delete': 'Suppression d’une demande',
  'lead.export': 'Export CSV des demandes',
  'review.invite': 'Invitation à laisser un avis',
  'review.invite_delete': 'Annulation d’une invitation',
  'review.submit': 'Avis déposé par un client',
  'review.moderate': 'Modération d’un avis',
  'review.delete': 'Suppression d’un avis',
  'content.settings': 'Coordonnées de l’entreprise',
  'content.claim': 'Affirmation commerciale',
  'content.service_create': 'Création d’une prestation',
  'content.service_update': 'Modification d’une prestation',
  'content.service_delete': 'Suppression d’une prestation',
  'content.faq_create': 'Ajout d’une question (FAQ)',
  'content.faq_update': 'Modification d’une question (FAQ)',
  'content.faq_delete': 'Suppression d’une question (FAQ)',
  'content.sector_create': 'Ajout d’un secteur',
  'content.sector_update': 'Modification d’un secteur',
  'content.sector_delete': 'Suppression d’un secteur',
  'user.create': 'Création d’un compte',
  'user.update': 'Modification d’un compte',
  'user.password_reset': 'Réinitialisation d’un mot de passe',
  'maintenance.run': 'Maintenance automatique',
}

function target(e: AuditEntry) {
  if (e.entityType === 'lead' && e.entityId) return <Link href={`/admin/demandes/${e.entityId}`}>Demande n° {e.entityId}</Link>
  if (e.entityType === 'service' && e.entityId) return <Link href={`/admin/contenu/prestations/${e.entityId}`}>Prestation n° {e.entityId}</Link>
  return e.entityId ? `${e.entityType ?? ''} ${e.entityId}` : '—'
}

export function AuditView({ items, nextBefore, paged }: { items: AuditEntry[]; nextBefore: string | null; paged: boolean }) {
  return (
    <>
      <PageHeader title="Journal" description="Actions réalisées dans le back-office et tâches automatiques (conservé 24 mois)." />
      <Panel>
        {items.length === 0 ? (
          <EmptyState title="Aucune entrée" />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Auteur</th>
                  <th scope="col">Action</th>
                  <th scope="col">Élément</th>
                  <th scope="col">Détails</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id}>
                    <td data-label="Date" className={styles.nowrap}>
                      {formatDateTime(e.createdAt)}
                    </td>
                    <td data-label="Auteur">{e.actorName ?? <span className={styles.muted}>Système / visiteur</span>}</td>
                    <td data-label="Action">{ACTIONS[e.action] ?? e.action}</td>
                    <td data-label="Élément">{target(e)}</td>
                    <td data-label="Détails">
                      {e.details && Object.keys(e.details).length > 0 ? (
                        <code className={styles.sub}>{JSON.stringify(e.details)}</code>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(paged || nextBefore) && (
          <div className={styles.pager}>
            {paged ? <Link href="/admin/journal">← Entrées les plus récentes</Link> : <span />}
            {nextBefore && (
              <Link href={`/admin/journal?avant=${nextBefore}`} className={`${styles.btn} ${styles.btnSecondary}`}>
                Entrées plus anciennes →
              </Link>
            )}
          </div>
        )}
      </Panel>
    </>
  )
}
