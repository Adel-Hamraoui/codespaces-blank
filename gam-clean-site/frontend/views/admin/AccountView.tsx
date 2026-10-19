'use client'

import { ActionForm, SubmitButton, TextField, type FormAction } from '@/frontend/components/admin/forms'
import { Flash, PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'
import { ADMIN_ROLES, labelOf } from '@/shared/constants'
import type { AdminUser } from '@/shared/types/admin'
import { PASSWORD_MIN } from '@/shared/validation/user'

export function AccountView({ user, firstLogin, action }: { user: AdminUser; firstLogin: boolean; action: FormAction }) {
  return (
    <>
      <PageHeader title="Mon compte" description={`${user.email} · ${labelOf(ADMIN_ROLES, user.role)}`} />
      {firstLogin && (
        <Flash tone="info">Première connexion : choisissez votre mot de passe personnel pour accéder au back-office.</Flash>
      )}
      <Panel title="Changer de mot de passe" description={`Au moins ${PASSWORD_MIN} caractères. Une phrase de passe facile à retenir est idéale.`}>
        <ActionForm
          action={action}
          resetOnSuccess
          render={(state) => {
            const e = state.fieldErrors ?? {}
            return (
              <>
                <TextField
                  label={firstLogin ? 'Mot de passe provisoire' : 'Mot de passe actuel'}
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  error={e.currentPassword}
                />
                <div className={styles.formRow}>
                  <TextField label="Nouveau mot de passe" name="newPassword" type="password" autoComplete="new-password" required error={e.newPassword} />
                  <TextField label="Confirmation" name="confirmPassword" type="password" autoComplete="new-password" required error={e.confirmPassword} />
                </div>
                <div className={styles.actions}>
                  <SubmitButton>Enregistrer le mot de passe</SubmitButton>
                </div>
              </>
            )
          }}
        />
      </Panel>
    </>
  )
}
