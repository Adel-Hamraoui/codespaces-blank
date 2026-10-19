'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, Check, LoaderCircle, Pencil, Phone, Send } from 'lucide-react'
import { track } from '@/frontend/lib/analytics'
import { FREQUENCIES, OTHER_SERVICE, PROFILES, labelOf, type RequestType } from '@/shared/constants'
import type { FieldErrors } from '@/shared/validation/common'
import {
  REQUEST_LIMITS as LIMITS,
  sanitizeRequest,
  validateRequest,
  type RequestField,
  type RequestInput,
} from '@/shared/validation/request'
import styles from './RequestForm.module.css'

type Props = {
  type: RequestType
  /** Prestations publiées proposées dans le formulaire de devis. */
  services: { slug: string; name: string }[]
  contact: { phone: { href: string; display: string }; email: string }
}

type Status = 'idle' | 'submitting' | 'error'
type Errors = FieldErrors<RequestField>

/** Formulaire de devis en trois étapes (affichées toutes ensemble sans JavaScript). */
const QUOTE_STEPS: { title: string; fields: RequestField[] }[] = [
  { title: 'Votre besoin', fields: ['services', 'frequency', 'profile'] },
  { title: 'Vos locaux', fields: ['location', 'surface', 'message'] },
  { title: 'Vos coordonnées', fields: ['name', 'company', 'phone', 'email'] },
]
const FIELD_ORDER: RequestField[] = ['services', 'location', 'surface', 'message', 'name', 'phone', 'email']

const pick = (errors: Errors, fields: RequestField[]): Errors =>
  Object.fromEntries(Object.entries(errors).filter(([k]) => fields.includes(k as RequestField)))

export function RequestForm({ type, services, contact }: Props) {
  const router = useRouter()
  const uid = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([])

  const isQuote = type === 'devis'
  const slugs = services.map((s) => s.slug)
  const choices = [...services.map((s) => ({ value: s.slug, label: s.name })), { value: OTHER_SERVICE, label: 'Autre besoin' }]

  // Amélioration progressive : les étapes ne se masquent qu'une fois le JavaScript actif.
  const [enhanced, setEnhanced] = useState(false)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [failure, setFailure] = useState<string | null>(null)
  const [preselected, setPreselected] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState('')
  const [sourcePath, setSourcePath] = useState('')
  const [recap, setRecap] = useState<RequestInput | null>(null)

  const stepped = enhanced && isQuote
  const lastStep = QUOTE_STEPS.length - 1
  const id = (name: string) => `${uid}-${name}`
  const errId = (name: string) => `${uid}-${name}-erreur`

  // Horodatage d'affichage (anti-spam), page d'origine, prestation pré-sélectionnée (?prestation=…).
  useEffect(() => {
    setEnhanced(true)
    setStartedAt(String(Date.now()))
    setSourcePath(`${window.location.pathname}${window.location.search}`.slice(0, LIMITS.sourcePath))
    const slug = new URLSearchParams(window.location.search).get('prestation')
    if (slug && choices.some((c) => c.value === slug)) setPreselected(slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function read(): RequestInput | null {
    const form = formRef.current
    if (!form) return null
    const fd = new FormData(form)
    const obj: Record<string, unknown> = Object.fromEntries(fd)
    obj.services = fd.getAll('services')
    obj.type = type
    return sanitizeRequest(obj, slugs)
  }

  const visibleFields = (): RequestField[] => (stepped ? QUOTE_STEPS[step].fields : FIELD_ORDER)
  const focusSummary = () => requestAnimationFrame(() => summaryRef.current?.focus())

  function goTo(target: number) {
    setStep(target)
    setErrors({})
    setAttempted(false)
    requestAnimationFrame(() => stepRefs.current[target]?.focus())
  }

  // Après une première tentative, les erreurs de l'étape affichée se mettent à jour en direct.
  function revalidate() {
    if (!attempted) return
    const input = read()
    if (input) setErrors(pick(validateRequest(input).errors, visibleFields()))
  }

  function next() {
    const input = read()
    if (!input) return
    const found = pick(validateRequest(input).errors, QUOTE_STEPS[step].fields)
    setAttempted(true)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      focusSummary()
      return
    }
    setRecap(input)
    track('form_step_complete', { type, step: step + 1 })
    goTo(step + 1)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Entrée dans un champ d'une étape intermédiaire : passage à l'étape suivante.
    if (stepped && step < lastStep) {
      next()
      return
    }
    const input = read()
    if (!input) return
    const found = validateRequest(input).errors
    setAttempted(true)
    setFailure(null)

    if (Object.keys(found).length > 0) {
      showErrors(found)
      return
    }

    setStatus('submitting')
    try {
      const fd = new FormData(e.currentTarget)
      const res = await fetch('/api/demande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, website: fd.get('website') ?? '', startedAt: fd.get('startedAt') ?? '' }),
      })
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: Errors; message?: string }
      if (res.ok && body.ok) {
        track('form_submit_success', { type })
        router.push(`/merci?demande=${type}`)
        return
      }
      setStatus('error')
      track('form_submit_error', { type, status: res.status })
      if (body.errors && Object.keys(body.errors).length > 0) {
        showErrors(body.errors)
        return
      }
      setFailure(
        res.status === 429
          ? 'Plusieurs demandes ont déjà été envoyées depuis votre connexion. Contactez-nous directement :'
          : 'Le service d’envoi est momentanément indisponible. Contactez-nous directement :'
      )
      focusSummary()
    } catch {
      setStatus('error')
      setFailure('La connexion a été interrompue. Réessayez, ou contactez-nous directement :')
      track('form_submit_error', { type, status: 0 })
      focusSummary()
    }
  }

  /** Affiche des erreurs ; en mode étapes, revient à la première étape concernée. */
  function showErrors(found: Errors) {
    setStatus('idle')
    if (stepped) {
      const target = QUOTE_STEPS.findIndex((s) => s.fields.some((f) => found[f]))
      if (target >= 0 && target !== step) setStep(target)
      setErrors(pick(found, QUOTE_STEPS[Math.max(target, 0)].fields))
    } else {
      setErrors(found)
    }
    focusSummary()
  }

  const errorList = FIELD_ORDER.filter((k) => errors[k])
  const describedBy = (name: RequestField, hint?: string) =>
    [hint, errors[name] ? errId(name) : null].filter(Boolean).join(' ') || undefined

  const fieldError = (name: RequestField) =>
    errors[name] ? (
      <p id={errId(name)} className={styles.error}>
        <AlertCircle size={16} aria-hidden="true" />
        {errors[name]}
      </p>
    ) : null

  const legend = (index: number, title: string) => (
    <legend className={styles.sectionTitle}>
      <span className={styles.step} aria-hidden="true">
        {index + 1}
      </span>
      {title}
      {stepped && <span className="sr-only"> (étape {index + 1} sur {QUOTE_STEPS.length})</span>}
    </legend>
  )

  const stepProps = (index: number) => ({
    ref: (el: HTMLFieldSetElement | null) => {
      stepRefs.current[index] = el
    },
    className: styles.section,
    hidden: stepped && step !== index,
    tabIndex: -1,
  })

  const serviceNames = (recap?.services ?? []).map((s) => labelOf(choices, s)).filter(Boolean)

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
      {stepped && (
        <ol className={styles.progress} aria-label="Étapes de la demande">
          {QUOTE_STEPS.map((s, i) => (
            <li
              key={s.title}
              className={i < step ? styles.done : i === step ? styles.current : undefined}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? (
                <button type="button" className={styles.progressItem} onClick={() => goTo(i)}>
                  <span className={styles.progressDot}>
                    <Check size={14} aria-hidden="true" />
                  </span>
                  <span className={styles.progressLabel}>
                    {s.title}
                    <span className="sr-only"> (terminée, modifier)</span>
                  </span>
                </button>
              ) : (
                <span className={styles.progressItem}>
                  <span className={styles.progressDot}>{i + 1}</span>
                  <span className={styles.progressLabel}>{s.title}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      <p id={`${uid}-intro`} className={styles.required}>
        Les champs marqués d’un <span aria-hidden="true">*</span>
        <span className="sr-only">astérisque</span> sont obligatoires.
      </p>

      {/* Résumé des erreurs (focalisé après une tentative incomplète ou un envoi en échec) */}
      <div ref={summaryRef} tabIndex={-1} className={styles.summaryWrap}>
        {(errorList.length > 0 || failure) && (
          <div className={styles.summary} role="alert">
            <p className={styles.summaryTitle}>
              <AlertCircle size={20} aria-hidden="true" />
              {errorList.length > 0
                ? `${errorList.length === 1 ? 'Un champ est' : `${errorList.length} champs sont`} à compléter ou à corriger :`
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
                {failure} <a href={contact.phone.href}>{contact.phone.display}</a> ·{' '}
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            )}
          </div>
        )}
      </div>

      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="startedAt" value={startedAt} readOnly />
      <input type="hidden" name="sourcePath" value={sourcePath} readOnly />
      {/* Champ piège pour les robots : invisible et ignoré par les humains. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={id('website')}>Ne pas remplir ce champ</label>
        <input id={id('website')} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {isQuote && (
        <>
          {/* ---------- Étape 1 : le besoin ---------- */}
          <fieldset {...stepProps(0)}>
            {legend(0, QUOTE_STEPS[0].title)}

            <fieldset className={styles.group} aria-describedby={describedBy('services')}>
              <legend className={styles.label}>
                Prestations souhaitées <span aria-hidden="true">*</span>
                <span className={styles.hint}> Plusieurs choix possibles</span>
              </legend>
              <div className={styles.chips}>
                {choices.map((c, i) => (
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
                {FREQUENCIES.map((f) => (
                  <label key={f.value} className={styles.chip}>
                    <input type="radio" name="frequency" value={f.value} />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={styles.field}>
              <label htmlFor={id('profile')} className={styles.label}>
                Vous êtes <span className={styles.optional}>(facultatif)</span>
              </label>
              <select id={id('profile')} name="profile" defaultValue="">
                <option value="">Choisir…</option>
                {PROFILES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          {/* ---------- Étape 2 : les locaux ---------- */}
          <fieldset {...stepProps(1)}>
            {legend(1, QUOTE_STEPS[1].title)}
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
                  aria-invalid={errors.surface ? true : undefined}
                  aria-describedby={describedBy('surface', `${uid}-surface-hint`)}
                />
                <p id={`${uid}-surface-hint`} className={styles.hint}>
                  En m², même approximative.
                </p>
                {fieldError('surface')}
              </div>
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
        </>
      )}

      {/* ---------- Coordonnées (étape 3 du devis, ou formulaire de contact) ---------- */}
      <fieldset {...(isQuote ? stepProps(2) : { className: styles.section })}>
        {isQuote ? (
          legend(2, QUOTE_STEPS[2].title)
        ) : (
          <legend className={styles.sectionTitle}>Vos coordonnées</legend>
        )}

        {stepped && recap && (
          <div className={styles.recap}>
            <p className={styles.recapTitle}>Votre demande</p>
            <dl>
              <div>
                <dt>Prestations</dt>
                <dd>{serviceNames.join(', ') || '—'}</dd>
              </div>
              {recap.frequency && (
                <div>
                  <dt>Fréquence</dt>
                  <dd>{labelOf(FREQUENCIES, recap.frequency)}</dd>
                </div>
              )}
              <div>
                <dt>Locaux</dt>
                <dd>
                  {recap.location}
                  {recap.surface ? ` · ${recap.surface} m²` : ''}
                </dd>
              </div>
            </dl>
            <button type="button" className={styles.recapEdit} onClick={() => goTo(0)}>
              <Pencil size={14} aria-hidden="true" /> Modifier
            </button>
          </div>
        )}

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

      {(!stepped || step === lastStep) && (
        <p className={styles.privacy}>
          Vos informations servent uniquement à répondre à votre demande. Elles ne sont ni vendues ni cédées.{' '}
          <Link href="/politique-de-confidentialite">Politique de confidentialité</Link>
        </p>
      )}

      <div className={styles.submitRow}>
        {stepped && step > 0 && (
          <button
            key="retour"
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={(e) => {
              e.preventDefault()
              goTo(step - 1)
            }}
          >
            <ArrowLeft size={18} aria-hidden="true" /> Retour
          </button>
        )}
        {/* « Continuer » est un bouton d'envoi : la touche Entrée fonctionne dans chaque étape
            et onSubmit passe à l'étape suivante. Clés distinctes : React ne réutilise pas
            l'élément d'un bouton à l'autre pendant un changement d'étape. */}
        {stepped && step < lastStep ? (
          <button key="continuer" type="submit" className="btn btn-lg">
            Continuer <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button key="envoyer" type="submit" className="btn btn-lg" disabled={status === 'submitting'}>
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
        )}
        <p className={styles.alt}>
          Vous préférez appeler ?{' '}
          <a href={contact.phone.href} data-track-location={`formulaire-${type}`}>
            <Phone size={16} aria-hidden="true" /> {contact.phone.display}
          </a>
        </p>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {status === 'submitting' ? 'Envoi de votre demande en cours.' : ''}
      </p>
    </form>
  )
}
