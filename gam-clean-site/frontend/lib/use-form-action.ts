'use client'

import { startTransition, useActionState, type FormEvent } from 'react'
import type { ActionState } from '@/shared/types/admin'

/**
 * Formulaire branché sur une action serveur, sans réinitialisation automatique.
 * React 19 vide un <form action={…}> à la fin de chaque envoi : en cas d'erreur
 * de validation, la saisie serait perdue. Avec JavaScript, l'envoi passe donc par
 * onSubmit ; sans JavaScript, l'attribut action garde le formulaire fonctionnel.
 */
export function useFormAction<S extends ActionState>(
  action: (prev: S, fd: FormData) => Promise<S>,
  initial: S = { ok: false } as S
) {
  const [state, dispatch, pending] = useActionState<S, FormData>(
    action as (prev: Awaited<S>, fd: FormData) => Promise<S>,
    initial as Awaited<S>
  )
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter
    const fd = new FormData(e.currentTarget, submitter instanceof HTMLElement ? submitter : null)
    startTransition(() => dispatch(fd))
  }
  return { state, pending, formProps: { action: dispatch, onSubmit } }
}
