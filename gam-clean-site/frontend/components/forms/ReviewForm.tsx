'use client'

import { useId } from 'react'
import { AlertCircle, CircleCheck, LoaderCircle, Send, Star } from 'lucide-react'
import { useFormAction } from '@/frontend/lib/use-form-action'
import type { ActionState } from '@/shared/types/admin'
import styles from './ReviewForm.module.css'

type Props = {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
  clientName: string
  services: { slug: string; name: string }[]
  defaultService: string | null
  brandName: string
}

const DETAILS = [
  { name: 'ratingQuality', label: 'Qualité du nettoyage' },
  { name: 'ratingPunctuality', label: 'Ponctualité et respect des horaires' },
  { name: 'ratingCommunication', label: 'Communication et suivi' },
] as const

/** Note de 1 à 5 : boutons radio natifs (clavier : flèches), affichés en étoiles. */
function StarInput({ name, legend, required, error }: { name: string; legend: string; required?: boolean; error?: string }) {
  const id = useId()
  return (
    <fieldset className={styles.rating} aria-describedby={error ? `${id}-err` : undefined}>
      <legend className={styles.label}>
        {legend} {required ? <span aria-hidden="true">*</span> : <span className={styles.optional}>(facultatif)</span>}
      </legend>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={styles.star}>
            <input type="radio" name={name} value={n} required={required && n === 1} />
            <Star size={30} aria-hidden="true" />
            <span className="sr-only">
              {n} sur 5
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-err`} className={styles.error}>
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}
    </fieldset>
  )
}

export function ReviewForm({ action, clientName, services, defaultService, brandName }: Props) {
  const { state, pending, formProps } = useFormAction(action)
  const uid = useId()
  const errors = state.fieldErrors ?? {}

  if (state.ok) {
    return (
      <div className={styles.thanks} role="status">
        <CircleCheck size={40} aria-hidden="true" />
        <h2>Merci {clientName} !</h2>
        <p>Votre avis a bien été transmis à {brandName}. Il sera relu avant une éventuelle publication.</p>
      </div>
    )
  }

  const field = (name: string) => ({
    id: `${uid}-${name}`,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${uid}-${name}-err` : undefined,
  })
  const fieldError = (name: string) =>
    errors[name] ? (
      <p id={`${uid}-${name}-err`} className={styles.error}>
        <AlertCircle size={16} aria-hidden="true" /> {errors[name]}
      </p>
    ) : null

  return (
    <form {...formProps} className={styles.form} noValidate>
      {state.message && !state.ok && (
        <p className={styles.alert} role="alert">
          <AlertCircle size={18} aria-hidden="true" /> {state.message}
        </p>
      )}

      <StarInput name="rating" legend="Votre note globale" required error={errors.rating} />

      <details className={styles.details}>
        <summary>Détailler ma note (facultatif)</summary>
        <div className={styles.detailGrid}>
          {DETAILS.map((d) => (
            <StarInput key={d.name} name={d.name} legend={d.label} />
          ))}
        </div>
      </details>

      <div className={styles.field}>
        <label htmlFor={`${uid}-comment`} className={styles.label}>
          Votre commentaire <span aria-hidden="true">*</span>
        </label>
        <textarea {...field('comment')} rows={5} maxLength={2000} required />
        {fieldError('comment')}
      </div>

      {services.length > 0 && (
        <div className={styles.field}>
          <label htmlFor={`${uid}-serviceSlug`} className={styles.label}>
            Prestation concernée <span className={styles.optional}>(facultatif)</span>
          </label>
          <select id={`${uid}-serviceSlug`} name="serviceSlug" defaultValue={defaultService ?? ''}>
            <option value="">Non précisée</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${uid}-authorName`} className={styles.label}>
            Nom affiché <span aria-hidden="true">*</span>
          </label>
          <input {...field('authorName')} type="text" maxLength={80} autoComplete="name" defaultValue={clientName} required />
          <p className={styles.hint}>Vous pouvez n’indiquer que votre prénom et l’initiale de votre nom.</p>
          {fieldError('authorName')}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${uid}-authorCompany`} className={styles.label}>
            Société <span className={styles.optional}>(facultatif)</span>
          </label>
          <input id={`${uid}-authorCompany`} name="authorCompany" type="text" maxLength={120} autoComplete="organization" />
        </div>
      </div>

      <label className={styles.consent}>
        <input type="checkbox" name="consentPublish" value="true" />
        <span>
          J’accepte que mon avis (note, commentaire, nom affiché et société) soit publié sur le site de {brandName}. Sans
          cette case, l’avis reste interne.
        </span>
      </label>

      <button type="submit" className="btn btn-lg" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle size={18} aria-hidden="true" className={styles.spin} /> Envoi…
          </>
        ) : (
          <>
            <Send size={18} aria-hidden="true" /> Envoyer mon avis
          </>
        )}
      </button>
    </form>
  )
}
