'use client'
// Formulaires de la fiche d'une demande (statut, suivi, notes, avis, suppression).
import { Send, Trash2 } from 'lucide-react'
import {
  ActionForm,
  Checkbox,
  CopyField,
  SelectField,
  SubmitButton,
  TextArea,
  TextField,
  type FormAction,
} from '@/frontend/components/admin/forms'
import { Flash, adminStyles as styles } from '@/frontend/components/admin/ui'
import { useFormAction } from '@/frontend/lib/use-form-action'
import { LEAD_STATUSES, type LeadStatus } from '@/shared/constants'
import type { InvitationState } from '@/shared/types/admin'

export function StatusForm({ id, status, action }: { id: string; status: LeadStatus; action: FormAction }) {
  return (
    <ActionForm action={action}>
      <input type="hidden" name="id" value={id} />
      <SelectField label="Statut" name="status" options={LEAD_STATUSES} defaultValue={status} />
      <div className={styles.actions}>
        <SubmitButton>Mettre à jour</SubmitButton>
      </div>
    </ActionForm>
  )
}

export function AssignForm({
  id,
  assigneeId,
  assignees,
  action,
}: {
  id: string
  assigneeId: number | null
  assignees: { id: number; displayName: string }[]
  action: FormAction
}) {
  return (
    <ActionForm action={action}>
      <input type="hidden" name="id" value={id} />
      <SelectField
        label="Suivi par"
        name="assignee"
        emptyLabel="Personne"
        options={assignees.map((a) => ({ value: String(a.id), label: a.displayName }))}
        defaultValue={assigneeId}
      />
      <div className={styles.actions}>
        <SubmitButton variant="secondary">Assigner</SubmitButton>
      </div>
    </ActionForm>
  )
}

export function NoteForm({ id, action }: { id: string; action: FormAction }) {
  return (
    <ActionForm
      action={action}
      resetOnSuccess
      render={(state) => (
        <>
          <input type="hidden" name="id" value={id} />
          <TextArea
            label="Ajouter une note interne"
            name="body"
            rows={3}
            max={2000}
            error={state.fieldErrors?.body}
            hint="Visible uniquement par l’équipe (appel passé, visite fixée, montant du devis…)."
          />
          <div className={styles.actions}>
            <SubmitButton variant="secondary">Enregistrer la note</SubmitButton>
          </div>
        </>
      )}
    />
  )
}

export function InvitationForm({
  leadId,
  clientName,
  clientEmail,
  action,
}: {
  leadId: string
  clientName: string
  clientEmail: string
  action: (prev: InvitationState, fd: FormData) => Promise<InvitationState>
}) {
  const { state, formProps } = useFormAction(action)
  const errors = state.fieldErrors ?? {}
  return (
    <form {...formProps} className={styles.form} noValidate>
      {state.message && <Flash tone={state.ok ? 'ok' : 'error'}>{state.message}</Flash>}
      {state.link ? (
        <CopyField label="Lien personnel à transmettre au client" value={state.link} />
      ) : (
        <>
          <input type="hidden" name="leadId" value={leadId} />
          <TextField label="Nom du client" name="clientName" defaultValue={clientName} required error={errors.clientName} />
          <TextField label="E-mail" name="clientEmail" type="email" defaultValue={clientEmail} error={errors.clientEmail} />
          <Checkbox name="sendEmail" label="Envoyer le lien par e-mail" defaultChecked />
          <div className={styles.actions}>
            <SubmitButton variant="secondary">
              <Send size={16} aria-hidden="true" /> Créer l’invitation
            </SubmitButton>
          </div>
        </>
      )}
    </form>
  )
}

export function DeleteLeadForm({ id, action }: { id: string; action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        variant="danger"
        confirm="Supprimer définitivement cette demande et son historique ? Cette action est irréversible."
      >
        <Trash2 size={16} aria-hidden="true" /> Supprimer la demande
      </SubmitButton>
    </form>
  )
}
