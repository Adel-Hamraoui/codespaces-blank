'use client'

import Image from 'next/image'
import { LogIn } from 'lucide-react'
import logo from '@/frontend/assets/brand/logo-light.png'
import { SubmitButton, TextField, type FormAction } from '@/frontend/components/admin/forms'
import { Flash, adminStyles as styles } from '@/frontend/components/admin/ui'
import { useFormAction } from '@/frontend/lib/use-form-action'

type Props = {
  action: FormAction
  /** Page demandée avant la redirection vers la connexion. */
  next: string | null
  loggedOut: boolean
  brandName: string
}

export function LoginView({ action, next, loggedOut, brandName }: Props) {
  const { state, formProps } = useFormAction(action)
  const errors = state.fieldErrors ?? {}
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <Image src={logo} alt={brandName} sizes="150px" priority />
        <h1>Back-office</h1>
        <p>Espace réservé à l’équipe de {brandName}.</p>
        {loggedOut && !state.message && <Flash tone="info">Vous êtes déconnecté.</Flash>}
        <form {...formProps} className={styles.form} noValidate>
          {state.message && <Flash tone="error">{state.message}</Flash>}
          <input type="hidden" name="suite" value={next ?? ''} />
          <TextField label="Adresse e-mail" name="email" type="email" autoComplete="username" required error={errors.email} />
          <TextField
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            error={errors.password}
          />
          <SubmitButton>
            <LogIn size={16} aria-hidden="true" /> Se connecter
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
