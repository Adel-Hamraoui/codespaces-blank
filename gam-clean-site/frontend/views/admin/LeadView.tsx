import { ArrowRightLeft, BellRing, Mail, MessageSquareText, Phone, Star, UserRoundCheck } from 'lucide-react'
import { Flash, LeadStatusBadge, PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'
import type { FormAction } from '@/frontend/components/admin/forms'
import { formatDateTime, formatRelative } from '@/frontend/lib/format'
import { FREQUENCIES, LEAD_STATUSES, LEAD_TYPES, PROFILES, labelOf } from '@/shared/constants'
import type { InvitationState, LeadDetail, LeadEvent } from '@/shared/types/admin'
import { formatPhone } from '@/shared/validation/common'
import { AssignForm, DeleteLeadForm, InvitationForm, NoteForm, StatusForm } from './LeadActions'

type Props = {
  lead: LeadDetail
  assignees: { id: number; displayName: string }[]
  canDelete: boolean
  now: number
  actions: {
    updateStatus: FormAction
    assign: FormAction
    addNote: FormAction
    createInvitation: (prev: InvitationState, fd: FormData) => Promise<InvitationState>
    deleteLead: (fd: FormData) => Promise<void>
  }
}

const EVENT_ICON = {
  status_change: ArrowRightLeft,
  note: MessageSquareText,
  assignment: UserRoundCheck,
  notification: BellRing,
  review_request: Star,
} as const

function eventText(e: LeadEvent) {
  switch (e.kind) {
    case 'status_change':
      return `Statut : ${e.fromStatus ? `${labelOf(LEAD_STATUSES, e.fromStatus)} → ` : ''}${labelOf(LEAD_STATUSES, e.toStatus)}`
    case 'assignment':
      return e.assigneeName ? `Suivi confié à ${e.assigneeName}` : 'Suivi retiré'
    case 'note':
      return 'Note'
    case 'notification':
      return e.body ?? 'Notification'
    case 'review_request':
      return e.body ?? 'Invitation à laisser un avis'
  }
}

export function LeadView({ lead, assignees, canDelete, now, actions }: Props) {
  const services = [...lead.serviceNames, ...(lead.otherNeed ? ['Autre besoin'] : [])]
  const rows: [string, React.ReactNode][] = [
    ['Type', labelOf(LEAD_TYPES, lead.type)],
    ['Société', lead.company],
    ['E-mail', <a key="e" href={`mailto:${lead.email}`}>{lead.email}</a>],
    ['Téléphone', lead.phone ? <a key="t" href={`tel:${lead.phone}`}>{formatPhone(lead.phone)}</a> : null],
    ['Lieu des locaux', lead.location],
    ['Prestations', services.length > 0 ? services.join(', ') : null],
    ['Fréquence', lead.frequency ? labelOf(FREQUENCIES, lead.frequency) : null],
    ['Profil', lead.profile ? labelOf(PROFILES, lead.profile) : null],
    ['Surface', lead.surfaceM2 ? `${lead.surfaceM2.toLocaleString('fr-FR')} m²` : null],
    ['Page d’origine', lead.sourcePath],
  ]

  return (
    <>
      <PageHeader
        back={{ href: '/admin/demandes', label: 'Toutes les demandes' }}
        title={
          <>
            {lead.name} <LeadStatusBadge status={lead.status} />
          </>
        }
        description={`Demande n° ${lead.id}, reçue le ${formatDateTime(lead.createdAt)} (${formatRelative(lead.createdAt, now)}).`}
        actions={
          <>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className={styles.btn}>
                <Phone size={16} aria-hidden="true" /> Appeler
              </a>
            )}
            <a href={`mailto:${lead.email}`} className={`${styles.btn} ${styles.btnSecondary}`}>
              <Mail size={16} aria-hidden="true" /> Écrire
            </a>
          </>
        }
      />
      {!lead.notifiedAt && (
        <Flash tone="error">
          L’e-mail de notification de cette demande n’a pas pu être envoyé (nouvel essai automatique chaque nuit).
        </Flash>
      )}

      <div className={styles.grid2}>
        <div className={styles.stack}>
          <Panel title="Détails de la demande">
            <dl className={styles.dl}>
              {rows
                .filter(([, v]) => v !== null && v !== '')
                .map(([k, v]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            {lead.message && (
              <>
                <h3 className={styles.label}>Message</h3>
                <p className={styles.message}>{lead.message}</p>
              </>
            )}
          </Panel>

          <Panel title="Historique" description="Changements de statut, suivi et notes, du plus récent au plus ancien.">
            <ol className={styles.timeline}>
              {lead.events.map((e) => {
                const Icon = EVENT_ICON[e.kind]
                return (
                  <li key={e.id}>
                    <span className={styles.timelineIcon}>
                      <Icon size={14} aria-hidden="true" />
                    </span>
                    <div className={styles.timelineBody}>
                      <p>
                        <strong>{eventText(e)}</strong>
                      </p>
                      {e.kind === 'note' && e.body && <p className={styles.note}>{e.body}</p>}
                      <p className={styles.timelineMeta}>
                        <time dateTime={e.createdAt}>{formatDateTime(e.createdAt)}</time>
                        {e.actorName ? ` · ${e.actorName}` : ''}
                      </p>
                    </div>
                  </li>
                )
              })}
              <li>
                <span className={styles.timelineIcon}>
                  <BellRing size={14} aria-hidden="true" />
                </span>
                <div className={styles.timelineBody}>
                  <p>
                    <strong>Demande reçue depuis le site</strong>
                  </p>
                  <p className={styles.timelineMeta}>
                    <time dateTime={lead.createdAt}>{formatDateTime(lead.createdAt)}</time>
                    {lead.notifiedAt ? ' · notification e-mail envoyée' : ' · notification e-mail en attente'}
                  </p>
                </div>
              </li>
            </ol>
          </Panel>
        </div>

        <div className={styles.stack}>
          <Panel title="Suivi">
            <div className={styles.stack}>
              <StatusForm id={lead.id} status={lead.status} action={actions.updateStatus} />
              <AssignForm id={lead.id} assigneeId={lead.assignedToId} assignees={assignees} action={actions.assign} />
            </div>
          </Panel>
          <Panel title="Notes">
            <NoteForm id={lead.id} action={actions.addNote} />
          </Panel>
          {lead.status === 'won' && (
            <Panel title="Avis client" description="Invitez le client à évaluer l’intervention (lien personnel, 60 jours).">
              <InvitationForm
                leadId={lead.id}
                clientName={lead.name}
                clientEmail={lead.email}
                action={actions.createInvitation}
              />
            </Panel>
          )}
          {canDelete && (
            <Panel title="Suppression" description="Pour répondre à une demande d’effacement (RGPD) ou retirer un doublon.">
              <DeleteLeadForm id={lead.id} action={actions.deleteLead} />
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}
