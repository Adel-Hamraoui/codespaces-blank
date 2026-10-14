'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AlertCircle, LoaderCircle, Phone, Send } from 'lucide-react'
import { company } from '@/content/site'
import { track } from '@/lib/analytics'
import {
  LIMITS,
  frequencyChoices,
  profileChoices,
  sanitize,
  serviceChoices,
  validate,
  type FieldErrors,
  type RequestData,
  type RequestType,
} from '@/lib/request-schema'
import styles from './RequestForm.module.css'

type Status = 'idle' | 'submitting' | 'error'

const FIELD_ORDER: (keyof RequestData)[] = [
  'services',
  'location',
  'message',
  'name',
  'phone',
  'email',
]

/** Lit les valeurs du formulaire (cases multiples incluses). */
function readForm(form: HTMLFormElement, type: RequestType): RequestData {
  const fd = new FormData(form)
  const obj: Record<string, unknown> = Object.fromEntries(fd)
  obj.services = fd.getAll('services')
  obj.type = type
  return sanitize(obj)
}

export function RequestForm({ type }: { type: RequestType }) {
  const router = useRouter()
  const uid = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [preselected, setPreselected] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState('')
  const [rateLimited, setRateLimited] = useState(false)

  const isQuote = type === 'devis'
  const id = (name: string) => `${uid}-${name}`
  const errId = (name: string) => `${uid}-${name}-erreur`

  // Horodatage d'affichage (anti-spam) + prestation pré-sélectionnée via ?prestation=…
  useEffect(() => {
    setStartedAt(String(Date.now()))
    const slug = new URLSearchParams(window.location.search).get('prestation')
    if (slug && serviceChoices.some((c) => c.value === slug)) setPreselected(slug)
  }, [])

  // Après une première tentative d'envoi, les erreurs se mettent à jour en direct.
  function revalidate() {
    if (!submitted || !formRef.current) return
    setErrors(validate(readForm(formRef.current, type)))
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = readForm(form, type)
    const found = validate(data)
    setSubmitted(true)
    setErrors(found)
    setRateLimited(false)

    if (Object.keys(found).length > 0) {
      setStatus('idle')
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    setStatus('submitting')
    try {
      const fd = new FormData(form)
      const res = await fetch('/api/demande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          website: fd.get('website') ?? '',
          startedAt: fd.get('startedAt') ?? '',
        }),
      })
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: FieldErrors }
      if (res.ok && body.ok) {
        track('form_submit_success', { type })
        router.push(`/merci?demande=${type}`)
        return
      }
      if (body.errors) setErrors(body.errors)
      setRateLimited(res.status === 429)
      setStatus('error')
      track('form_submit_error', { type, status: res.status })
      requestAnimationFrame(() => summaryRef.current?.focus())
    } catch {
      setStatus('error')
      track('form_submit_error', { type, status: 0 })
      requestAnimationFrame(() => summaryRef.current?.focus())
    }
  }

  const errorList = FIELD_ORDER.filter((k) => errors[k])
  const describedBy = (name: keyof RequestData, hint?: string) =>
    [hint, errors[name] ? errId(name) : null].filter(Boolean).join(' ') || undefined

  const fieldError = (name: keyof RequestData) =>
    errors[name] ? (
      <p id={errId(name)} className={styles.error}>
        <AlertCircle size={16} aria-hidden="true" />
        {errors[name]}
      </p>
    ) : null

  return (
    <form
      ref={formRef}
      className={styles.form}
      action="/api/demande"
      method="post"
      noValidate
      onSubmit={onSubmit}
      onChange={revalidate}
      aria-describedby={`${uid}-intro`}
    >
      <p id={`${uid}-intro`} className={styles.required}>
        Les champs marqués d’un <span aria-hidden="true">*</span>
        <span className="sr-only">astérisque</span> sont obligatoires.
      </p>

      {/* Résumé des erreurs (focalisé après un envoi incomplet ou en échec) */}
      <div ref={summaryRef} tabIndex={-1} className={styles.summaryWrap}>
        {(errorList.length > 0 || status === 'error') && (
          <div className={styles.summary} role="alert">
            <p className={styles.summaryTitle}>
              <AlertCircle size={20} aria-hidden="true" />
              {errorList.length > 0
                ? `${errorList.length === 1 ? 'Un champ est' : `${errorList.length} champs sont`} à compléter ou à corriger :`
                : 'Votre demande n’a pas pu être envoyée.'}
            </p>
            {errorList.length > 0 ? (
              <ul>
                {errorList.map((k) => (
                  <li key={k}>
                    <a href={`#${k === 'services' ? id('services-0') : id(k)}`}>{errors[k]}</a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {rateLimited
                  ? 'Plusieurs demandes ont déjà été envoyées depuis votre connexion. Contactez-nous directement :'
                  : 'Le service d’envoi est momentanément indisponible. Contactez-nous directement :'}{' '}
                <a href={company.phone.href}>{company.phone.display}</a> ·{' '}
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </p>
            )}
          </div>
        )}
      </div>

      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="startedAt" value={startedAt} readOnly />
      {/* Champ piège pour les robots : invisible et ignoré par les humains. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={id('website')}>Ne pas remplir ce champ</label>
        <input id={id('website')} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {isQuote && (
        <fieldset className={styles.section}>
          <legend className={styles.sectionTitle}>
            <span className={styles.step} aria-hidden="true">
              1
            </span>
            Votre besoin
          </legend>

          <fieldset
            className={styles.group}
            aria-describedby={describedBy('services')}
          >
            <legend className={styles.label}>
              Prestations souhaitées <span aria-hidden="true">*</span>
              <span className={styles.hint}> Plusieurs choix possibles</span>
            </legend>
            <div className={styles.chips}>
              {serviceChoices.map((c, i) => (
                <label key={`${c.value}-${preselected ?? ''}`} className={styles.chip}>
                  <input
                    id={id(`services-${i}`)}
                    type="checkbox"
                    name="services"
                    value={c.value}
                    defaultChecked={preselected === c.value}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
            {fieldError('services')}
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.label}>Fréquence souhaitée</legend>
            <div className={styles.chips}>
              {frequencyChoices.map((f) => (
                <label key={f} className={styles.chip}>
                  <input type="radio" name="frequency" value={f} />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor={id('location')} className={styles.label}>
                Ville ou code postal des locaux <span aria-hidden="true">*</span>
              </label>
              <input
                id={id('location')}
                name="location"
                type="text"
                required
                maxLength={LIMITS.location}
                autoComplete="address-level2"
                aria-invalid={errors.location ? true : undefined}
                aria-describedby={describedBy('location')}
              />
              {fieldError('location')}
            </div>
            <div className={styles.field}>
              <label htmlFor={id('surface')} className={styles.label}>
                Surface approximative <span className={styles.optional}>(facultatif)</span>
              </label>
              <input
                id={id('surface')}
                name="surface"
                type="text"
                inputMode="numeric"
                maxLength={LIMITS.surface}
                aria-describedby={`${uid}-surface-hint`}
              />
              <p id={`${uid}-surface-hint`} className={styles.hint}>
                En m², même approximative.
              </p>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor={id('profile')} className={styles.label}>
              Vous êtes <span className={styles.optional}>(facultatif)</span>
            </label>
            <select id={id('profile')} name="profile" defaultValue="">
              <option value="">Choisir…</option>
              {profileChoices.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor={id('message')} className={styles.label}>
              Précisions <span className={styles.optional}>(facultatif)</span>
            </label>
            <textarea
              id={id('message')}
              name="message"
              rows={4}
              maxLength={LIMITS.message}
              aria-describedby={`${uid}-message-hint`}
            />
            <p id={`${uid}-message-hint`} className={styles.hint}>
              Type de locaux, horaires possibles, date souhaitée, contraintes d’accès…
            </p>
          </div>
        </fieldset>
      )}

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>
          {isQuote && (
            <span className={styles.step} aria-hidden="true">
              2
            </span>
          )}
          Vos coordonnées
        </legend>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor={id('name')} className={styles.label}>
              Nom et prénom <span aria-hidden="true">*</span>
            </label>
            <input
              id={id('name')}
              name="name"
              type="text"
              required
              maxLength={LIMITS.name}
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy('name')}
            />
            {fieldError('name')}
          </div>
          <div className={styles.field}>
            <label htmlFor={id('company')} className={styles.label}>
              Société ou organisme <span className={styles.optional}>(facultatif)</span>
            </label>
            <input id={id('company')} name="company" type="text" maxLength={LIMITS.company} autoComplete="organization" />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor={id('phone')} className={styles.label}>
              Téléphone{' '}
              {isQuote ? <span aria-hidden="true">*</span> : <span className={styles.optional}>(facultatif)</span>}
            </label>
            <input
              id={id('phone')}
              name="phone"
              type="tel"
              required={isQuote}
              maxLength={LIMITS.phone}
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={describedBy('phone')}
            />
            {fieldError('phone')}
          </div>
          <div className={styles.field}>
            <label htmlFor={id('email')} className={styles.label}>
              E-mail <span aria-hidden="true">*</span>
            </label>
            <input
              id={id('email')}
              name="email"
              type="email"
              required
              maxLength={LIMITS.email}
              autoComplete="email"
              spellCheck={false}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy('email')}
            />
            {fieldError('email')}
          </div>
        </div>

        {!isQuote && (
          <div className={styles.field}>
            <label htmlFor={id('message')} className={styles.label}>
              Votre message <span aria-hidden="true">*</span>
            </label>
            <textarea
              id={id('message')}
              name="message"
              rows={6}
              required
              maxLength={LIMITS.message}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={describedBy('message')}
            />
            {fieldError('message')}
          </div>
        )}
      </fieldset>

      <p className={styles.privacy}>
        Vos informations servent uniquement à répondre à votre demande. Elles ne sont ni vendues ni cédées.{' '}
        <Link href="/politique-de-confidentialite">Politique de confidentialité</Link>
      </p>

      <div className={styles.submitRow}>
        <button
          type="submit"
          className="btn btn-lg"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? (
            <>
              <LoaderCircle size={18} aria-hidden="true" className={styles.spin} /> Envoi en cours…
            </>
          ) : (
            <>
              <Send size={18} aria-hidden="true" /> {isQuote ? 'Envoyer ma demande de devis' : 'Envoyer le message'}
            </>
          )}
        </button>
        <p className={styles.alt}>
          Vous préférez appeler ?{' '}
          <a href={company.phone.href} data-track-location={`formulaire-${type}`}>
            <Phone size={16} aria-hidden="true" /> {company.phone.display}
          </a>
        </p>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {status === 'submitting' ? 'Envoi de votre demande en cours.' : ''}
      </p>
    </form>
  )
}
