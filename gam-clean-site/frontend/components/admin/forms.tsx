'use client'
// ============================================================================
// Briques de formulaire du back-office (composants client).
// ============================================================================
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { Check, Copy, LoaderCircle } from 'lucide-react'
import { useFormAction } from '@/frontend/lib/use-form-action'
import type { ActionState } from '@/shared/types/admin'
import { Flash } from './ui'
import styles from './admin.module.css'

export type FormAction = (prev: ActionState, fd: FormData) => Promise<ActionState>

/** Bouton d'envoi qui se désactive pendant le traitement. */
export function SubmitButton({
  children,
  variant = 'primary',
  small,
  name,
  value,
  disabled,
  confirm,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  small?: boolean
  name?: string
  value?: string
  disabled?: boolean
  /** Message de confirmation affiché avant l'envoi (actions irréversibles). */
  confirm?: string
}) {
  const { pending } = useFormStatus()
  const cls = [
    styles.btn,
    variant === 'secondary' ? styles.btnSecondary : variant === 'danger' ? styles.btnDanger : '',
    small ? styles.btnSmall : '',
  ].join(' ')
  return (
    <button
      type="submit"
      className={cls}
      name={name}
      value={value}
      disabled={pending || disabled}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault()
      }}
    >
      {pending && <LoaderCircle size={16} aria-hidden="true" className="spin" />}
      {children}
    </button>
  )
}

/**
 * Message affiché quand une opération dépasse le délai normal, au lieu d'un
 * indicateur de chargement sans fin. Une action ne peut pas être annulée une
 * fois envoyée : la personne vérifie après rechargement avant de recommencer.
 */
export function StallNotice({ navigation }: { navigation?: boolean }) {
  return (
    <Flash tone="error">
      {navigation
        ? 'La page met plus de temps que prévu à s’afficher.'
        : 'Le serveur met plus de temps que prévu à répondre. L’opération a peut-être déjà été enregistrée : vérifiez-le après le rechargement avant de recommencer.'}{' '}
      <button type="button" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`} onClick={() => window.location.reload()}>
        Recharger la page
      </button>
    </Flash>
  )
}

/**
 * Formulaire relié à une action serveur : la saisie est conservée en cas
 * d'erreur, le message de résultat s'affiche au-dessus des champs.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  render,
}: {
  action: FormAction
  children?: ReactNode
  className?: string
  /** Vide le formulaire après un succès (ajout d'une note, d'un élément…). */
  resetOnSuccess?: boolean
  /** Contenu dépendant du résultat (erreurs par champ). */
  render?: (state: ActionState) => ReactNode
}) {
  const { state, stalled, formProps } = useFormAction(action)
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset()
  }, [state, resetOnSuccess])

  const hasFieldErrors = !state.ok && state.fieldErrors && Object.keys(state.fieldErrors).length > 0
  return (
    <form ref={ref} {...formProps} className={`${styles.form} ${className ?? ''}`} noValidate>
      {stalled && <StallNotice />}
      {state.message && <Flash tone={state.ok ? 'ok' : 'error'}>{state.message}</Flash>}
      {!state.message && hasFieldErrors && <Flash tone="error">Certains champs sont à corriger.</Flash>}
      {render ? render(state) : children}
    </form>
  )
}

type FieldProps = {
  label: string
  name: string
  error?: string
  hint?: ReactNode
  /** Compteur de caractères (champs SEO). */
  max?: number
  children?: never
}

function useFieldIds(name: string) {
  const uid = useId()
  return { id: `${uid}-${name}`, hintId: `${uid}-${name}-aide`, errId: `${uid}-${name}-erreur`, countId: `${uid}-${name}-compte` }
}

/** Compteur de caractères, hors de l'étiquette (il ne fait pas partie du nom du champ). */
function Counter({ id, value, max }: { id: string; value: string; max: number }) {
  const n = value.length
  return (
    <span id={id} className={`${styles.counter} ${n > max ? styles.counterOver : ''}`}>
      {n} / {max} caractères
    </span>
  )
}

export function TextField({
  label,
  name,
  error,
  hint,
  max,
  defaultValue,
  type = 'text',
  required,
  autoComplete,
  placeholder,
  inputMode,
}: FieldProps & {
  defaultValue?: string | number | null
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'search'
  required?: boolean
  autoComplete?: string
  placeholder?: string
  inputMode?: 'numeric' | 'tel' | 'email' | 'text'
}) {
  const ids = useFieldIds(name)
  const [value, setValue] = useState(String(defaultValue ?? ''))
  const describedBy =
    [hint ? ids.hintId : null, max ? ids.countId : null, error ? ids.errId : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={ids.id} className={styles.label}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {max && <Counter id={ids.countId} value={value} max={max} />}
      </div>
      <input
        id={ids.id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={max ? (e) => setValue(e.target.value) : undefined}
      />
      {hint && (
        <p id={ids.hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={ids.errId} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  )
}

export function TextArea({
  label,
  name,
  error,
  hint,
  max,
  defaultValue,
  rows = 4,
  required,
  code,
}: FieldProps & { defaultValue?: string | null; rows?: number; required?: boolean; code?: boolean }) {
  const ids = useFieldIds(name)
  const [value, setValue] = useState(defaultValue ?? '')
  const describedBy =
    [hint ? ids.hintId : null, max ? ids.countId : null, error ? ids.errId : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={ids.id} className={styles.label}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {max && <Counter id={ids.countId} value={value} max={max} />}
      </div>
      <textarea
        id={ids.id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        required={required}
        className={code ? styles.code : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={max ? (e) => setValue(e.target.value) : undefined}
      />
      {hint && (
        <p id={ids.hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={ids.errId} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  )
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  error,
  hint,
  emptyLabel,
}: FieldProps & {
  options: readonly { value: string; label: string }[]
  defaultValue?: string | number | null
  emptyLabel?: string
}) {
  const ids = useFieldIds(name)
  return (
    <div className={styles.field}>
      <label htmlFor={ids.id} className={styles.label}>
        {label}
      </label>
      <select
        id={ids.id}
        name={name}
        defaultValue={defaultValue === null || defaultValue === undefined ? '' : String(defaultValue)}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint ? ids.hintId : undefined}
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={ids.hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  )
}

export function Checkbox({
  label,
  name,
  defaultChecked,
  value = 'true',
  description,
}: {
  label: ReactNode
  name: string
  defaultChecked?: boolean
  value?: string
  description?: ReactNode
}) {
  return (
    <label className={styles.check}>
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} />
      <span>
        {label}
        {description && <small>{description}</small>}
      </span>
    </label>
  )
}

/** Champ en lecture seule avec bouton « Copier » (lien d'invitation…). */
export function CopyField({ label, value }: { label: string; value: string }) {
  const id = useId()
  const [copied, setCopied] = useState(false)
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.copy}>
        <input id={id} className={styles.input} value={value} readOnly onFocus={(e) => e.currentTarget.select()} />
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value)
              setCopied(true)
              setTimeout(() => setCopied(false), 2500)
            } catch {
              setCopied(false)
            }
          }}
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
    </div>
  )
}
