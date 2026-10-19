'use client'
// Modération d'un avis et création d'invitations (écran « Avis clients »).
import { Check, Send, Trash2, Undo2, X } from 'lucide-react'
import { ActionForm, Checkbox, CopyField, SubmitButton, TextField, type FormAction } from '@/frontend/components/admin/forms'
import { Flash, adminStyles as styles } from '@/frontend/components/admin/ui'
import { useFormAction } from '@/frontend/lib/use-form-action'
import type { ReviewStatus } from '@/shared/constants'
import type { InvitationState } from '@/shared/types/admin'

export function ModerationForm({
  id,
  status,
  consent,
  moderate,
  remove,
}: {
  id: string
  status: ReviewStatus
  consent: boolean
  moderate: FormAction
  remove: FormAction
}) {
  return (
    <div className={styles.stack}>
      <ActionForm action={moderate}>
        <input type="hidden" name="id" value={id} />
        {status !== 'rejected' && status !== 'published' && (
          <TextField label="Motif du refus (facultatif, interne)" name="reason" max={300} />
        )}
        <div className={styles.actions}>
          {status !== 'published' && (
            <SubmitButton name="status" value="published" disabled={!consent} small>
              <Check size={14} aria-hidden="true" /> Publier
            </SubmitButton>
          )}
          {status !== 'rejected' && (
            <SubmitButton name="status" value="rejected" variant="secondary" small>
              <X size={14} aria-hidden="true" /> Refuser
            </SubmitButton>
          )}
          {status !== 'pending' && (
            <SubmitButton name="status" value="pending" variant="secondary" small>
              <Undo2 size={14} aria-hidden="true" /> Remettre en attente
            </SubmitButton>
          )}
        </div>
        {!consent && <p className={styles.hint}>Le client n’a pas autorisé la publication : l’avis reste interne.</p>}
      </ActionForm>
      <ActionForm action={remove}>
        <input type="hidden" name="id" value={id} />
        <SubmitButton variant="danger" small confirm="Supprimer définitivement cet avis ?">
          <Trash2 size={14} aria-hidden="true" /> Supprimer
        </SubmitButton>
      </ActionForm>
    </div>
  )
}

export function NewInvitationForm({ action }: { action: (prev: InvitationState, fd: FormData) => Promise<InvitationState> }) {
  const { state, formProps } = useFormAction(action)
  const errors = state.fieldErrors ?? {}
  return (
    <form key={state.link ?? 'nouvelle'} {...formProps} className={styles.form} noValidate>
      {state.message && <Flash tone={state.ok ? 'ok' : 'error'}>{state.message}</Flash>}
      {state.link && <CopyField label="Lien personnel à transmettre" value={state.link} />}
      <div className={styles.formRow}>
        <TextField label="Nom du client" name="clientName" required error={errors.clientName} />
        <TextField label="E-mail (facultatif)" name="clientEmail" type="email" error={errors.clientEmail} />
      </div>
      <Checkbox name="sendEmail" label="Envoyer le lien par e-mail" description="Sinon, copiez le lien et transmettez-le vous-même." />
      <div className={styles.actions}>
        <SubmitButton>
          <Send size={16} aria-hidden="true" /> Créer une invitation
        </SubmitButton>
      </div>
    </form>
  )
}

export function DeleteInvitationForm({ id, action }: { id: string; action: FormAction }) {
  return (
    <ActionForm action={action}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="danger" small confirm="Annuler cette invitation ? Le lien ne fonctionnera plus.">
        Annuler
      </SubmitButton>
    </ActionForm>
  )
}
