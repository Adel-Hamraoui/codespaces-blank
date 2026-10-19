'use client'

import { startTransition, useActionState, useEffect, useState, type FormEvent } from 'react'
import type { ActionState } from '@/shared/types/admin'

/** Durée au-delà de laquelle une opération en cours est signalée comme anormalement longue. */
export const STALL_MS = 15_000

/**
 * Vrai lorsque `pending` reste vrai plus de `delay` ms (serveur très lent, réponse
 * retenue) : l'interface affiche alors un message au lieu d'un indicateur sans fin.
 */
export function usePendingTooLong(pending: boolean, delay = STALL_MS) {
  const [stalled, setStalled] = useState(false)
  useEffect(() => {
    if (!pending) return
    const id = setTimeout(() => setStalled(true), delay)
    return () => {
      clearTimeout(id)
      setStalled(false)
    }
  }, [pending, delay])
  return pending && stalled
}

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
  const stalled = usePendingTooLong(pending)
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter
    const fd = new FormData(e.currentTarget, submitter instanceof HTMLElement ? submitter : null)
    startTransition(() => dispatch(fd))
  }
  return { state, pending, stalled, formProps: { action: dispatch, onSubmit } }
}
