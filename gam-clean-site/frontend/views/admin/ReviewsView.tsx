import Link from 'next/link'
import { Star } from 'lucide-react'
import type { FormAction } from '@/frontend/components/admin/forms'
import { Badge, EmptyState, PageHeader, Panel, ReviewStatusBadge, adminStyles as styles } from '@/frontend/components/admin/ui'
import { Stars } from '@/frontend/components/ui/Stars'
import { formatDateTime, formatShortDate } from '@/frontend/lib/format'
import { REVIEW_STATUSES, type ReviewStatus } from '@/shared/constants'
import type { InvitationState, ReviewRequestRow, ReviewRow } from '@/shared/types/admin'
import { DeleteInvitationForm, ModerationForm, NewInvitationForm } from './ReviewActions'
import css from './ReviewsView.module.css'

type Props = {
  reviews: ReviewRow[]
  status: ReviewStatus | null
  counts: Record<ReviewStatus, number>
  requests: ReviewRequestRow[]
  now: number
  actions: {
    moderate: FormAction
    remove: FormAction
    invite: (prev: InvitationState, fd: FormData) => Promise<InvitationState>
    cancelInvitation: FormAction
  }
}

const DETAIL_LABELS = [
  ['ratingQuality', 'Qualité'],
  ['ratingPunctuality', 'Ponctualité'],
  ['ratingCommunication', 'Communication'],
] as const

function requestState(r: ReviewRequestRow, now: number) {
  if (r.usedAt) return <Badge tone="success">Avis reçu</Badge>
  if (new Date(r.expiresAt).getTime() < now) return <Badge tone="neutral">Expirée</Badge>
  return <Badge tone="info">En attente</Badge>
}

export function ReviewsView({ reviews, status, counts, requests, now, actions }: Props) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const tabs = [
    { value: null, label: 'Tous', count: total },
    ...REVIEW_STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts[s.value] })),
  ]
  return (
    <>
      <PageHeader
        title="Avis clients"
        description="Seuls les avis déposés via un lien d’invitation existent ici ; un avis n’est publié qu’avec l’accord de son auteur."
      />

      <nav aria-label="Filtrer par statut">
        <ul className={styles.tabs}>
          {tabs.map((t) => (
            <li key={t.label}>
              <Link
                href={t.value ? `/admin/avis?statut=${t.value}` : '/admin/avis'}
                className={styles.tab}
                aria-current={status === t.value ? 'page' : undefined}
              >
                {t.label} <span className={styles.tabCount}>{t.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.grid2}>
        <div className={styles.stack}>
          {reviews.length === 0 ? (
            <Panel>
              <EmptyState title="Aucun avis" icon={<Star size={40} aria-hidden="true" />}>
                Créez une invitation pour un client satisfait : il recevra un lien personnel pour déposer son avis.
              </EmptyState>
            </Panel>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className={`${styles.panel} ${css.review}`}>
                <header className={css.head}>
                  <Stars rating={r.rating} />
                  <ReviewStatusBadge status={r.status} />
                  {r.consentPublish ? (
                    <Badge tone="success">Publication autorisée</Badge>
                  ) : (
                    <Badge tone="neutral">Publication non autorisée</Badge>
                  )}
                </header>
                <blockquote className={css.comment}>{r.comment}</blockquote>
                <p className={css.author}>
                  <strong>{r.authorName}</strong>
                  {r.authorCompany ? `, ${r.authorCompany}` : ''}
                  {r.serviceName ? ` · ${r.serviceName}` : ''} · déposé le {formatDateTime(r.createdAt)}
                </p>
                {DETAIL_LABELS.some(([k]) => r[k]) && (
                  <ul className={css.details}>
                    {DETAIL_LABELS.map(([k, label]) =>
                      r[k] ? (
                        <li key={k}>
                          {label} : {r[k]}/5
                        </li>
                      ) : null
                    )}
                  </ul>
                )}
                {r.moderatedAt && (
                  <p className={styles.hint}>
                    Modéré le {formatDateTime(r.moderatedAt)}
                    {r.moderatorName ? ` par ${r.moderatorName}` : ''}
                    {r.rejectionReason ? ` — motif : ${r.rejectionReason}` : ''}
                  </p>
                )}
                <ModerationForm
                  id={r.id}
                  status={r.status}
                  consent={r.consentPublish}
                  moderate={actions.moderate}
                  remove={actions.remove}
                />
              </article>
            ))
          )}
        </div>

        <div className={styles.stack}>
          <Panel title="Inviter un client" description="Lien personnel, valable 60 jours, utilisable une seule fois.">
            <NewInvitationForm action={actions.invite} />
          </Panel>
          <Panel title="Invitations récentes">
            {requests.length === 0 ? (
              <p className={styles.muted}>Aucune invitation pour le moment.</p>
            ) : (
              <ul className={css.requests}>
                {requests.map((r) => (
                  <li key={r.id}>
                    <div>
                      <strong>{r.clientName}</strong> {requestState(r, now)}
                      <span className={styles.sub}>
                        Créée le {formatShortDate(r.createdAt)}
                        {r.createdByName ? ` par ${r.createdByName}` : ''}
                        {r.leadId ? (
                          <>
                            {' · '}
                            <Link href={`/admin/demandes/${r.leadId}`}>demande n° {r.leadId}</Link>
                          </>
                        ) : null}
                      </span>
                    </div>
                    {!r.usedAt && <DeleteInvitationForm id={r.id} action={actions.cancelInvitation} />}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}
