'use client'

import { KeyRound, UserPlus } from 'lucide-react'
import { ActionForm, Checkbox, SelectField, SubmitButton, TextField, type FormAction } from '@/frontend/components/admin/forms'
import { Badge, Flash, PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'
import { formatDateTime } from '@/frontend/lib/format'
import { useFormAction } from '@/frontend/lib/use-form-action'
import { ADMIN_ROLES, labelOf } from '@/shared/constants'
import type { AdminUserRow, PasswordState } from '@/shared/types/admin'

type PasswordAction = (prev: PasswordState, fd: FormData) => Promise<PasswordState>

type Props = {
  users: AdminUserRow[]
  currentUserId: number
  now: number
  actions: { create: PasswordAction; update: FormAction; resetPassword: PasswordAction }
}

const ROLES = ADMIN_ROLES.map((r) => ({ value: r.value, label: `${r.label} — ${r.description}` }))

function TemporaryPassword({ state }: { state: PasswordState }) {
  if (!state.message) return null
  return (
    <Flash tone={state.ok ? 'ok' : 'error'}>
      {state.message} {state.temporaryPassword && <span className={styles.secret}>{state.temporaryPassword}</span>}
    </Flash>
  )
}

function CreateUserForm({ action }: { action: PasswordAction }) {
  const { state, formProps } = useFormAction(action)
  const e = state.fieldErrors ?? {}
  return (
    <form {...formProps} className={styles.form} noValidate key={state.temporaryPassword ?? 'nouveau'}>
      <TemporaryPassword state={state} />
      <div className={styles.formRow}>
        <TextField label="Nom affiché" name="displayName" required error={e.displayName} />
        <TextField label="E-mail" name="email" type="email" required error={e.email} />
      </div>
      <SelectField label="Rôle" name="role" options={ROLES} defaultValue="sales" />
      <div className={styles.actions}>
        <SubmitButton>
          <UserPlus size={16} aria-hidden="true" /> Créer le compte
        </SubmitButton>
      </div>
    </form>
  )
}

function ResetPasswordForm({ id, action }: { id: number; action: PasswordAction }) {
  const { state, formProps } = useFormAction(action)
  return (
    <form {...formProps} className={styles.form}>
      <TemporaryPassword state={state} />
      <input type="hidden" name="id" value={id} />
      <div className={styles.actions}>
        <SubmitButton variant="secondary" small confirm="Générer un nouveau mot de passe provisoire ? Les sessions de ce compte seront fermées.">
          <KeyRound size={14} aria-hidden="true" /> Réinitialiser le mot de passe
        </SubmitButton>
      </div>
    </form>
  )
}

export function UsersView({ users, currentUserId, now, actions }: Props) {
  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Un compte nominatif par personne : chaque action est attribuée à son auteur dans le journal."
      />
      <div className={styles.grid2}>
        <div className={styles.stack}>
          {users.map((u) => {
            const locked = u.lockedUntil !== null && new Date(u.lockedUntil).getTime() > now
            return (
              <details key={u.id} className={styles.editItem}>
                <summary>
                  <span className={styles.grow}>
                    {u.displayName}
                    <span className={styles.sub}>{u.email}</span>
                  </span>
                  <Badge tone="info">{labelOf(ADMIN_ROLES, u.role)}</Badge>
                  {!u.isActive && <Badge tone="neutral">Désactivé</Badge>}
                  {locked && <Badge tone="danger">Verrouillé</Badge>}
                  {u.mustChangePassword && <Badge tone="warning">Mot de passe provisoire</Badge>}
                </summary>
                <div className={styles.editBody}>
                  <p className={styles.hint}>
                    Créé le {formatDateTime(u.createdAt)} · dernière connexion :{' '}
                    {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'jamais'}
                  </p>
                  <ActionForm action={actions.update}>
                    <input type="hidden" name="id" value={u.id} />
                    <SelectField label="Rôle" name="role" options={ROLES} defaultValue={u.role} />
                    <Checkbox
                      name="isActive"
                      defaultChecked={u.isActive}
                      label="Compte actif"
                      description={u.id === currentUserId ? 'C’est votre compte.' : 'Décocher ferme immédiatement ses sessions.'}
                    />
                    <div className={styles.actions}>
                      <SubmitButton>Enregistrer</SubmitButton>
                    </div>
                  </ActionForm>
                  {u.id !== currentUserId && <ResetPasswordForm id={u.id} action={actions.resetPassword} />}
                </div>
              </details>
            )
          })}
        </div>
        <Panel title="Nouveau compte" description="Un mot de passe provisoire est généré : il devra être changé à la première connexion.">
          <CreateUserForm action={actions.create} />
        </Panel>
      </div>
    </>
  )
}
