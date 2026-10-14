// ============================================================================
// POST /api/demande — réception des demandes de devis et de contact.
// Accepte du JSON (formulaire avec JavaScript) ou un envoi de formulaire HTML
// classique (navigateur sans JavaScript : redirection vers /merci).
// ============================================================================
import { NextResponse, type NextRequest } from 'next/server'
import { sanitize, validate } from '@/lib/request-schema'
import { deliverRequest } from '@/lib/delivery'
import { isRateLimited } from '@/lib/rate-limit'
import { company } from '@/content/site'

const MAX_BODY_BYTES = 20_000
const MIN_FILL_TIME_MS = 3_000

const FAILURE_MESSAGE = `Votre demande n’a pas pu être transmise. Appelez-nous au ${company.phone.display} ou écrivez-nous à ${company.email}.`

function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'inconnu'
}

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (!origin) return true // certains navigateurs n'envoient pas Origin sur un POST de formulaire
  try {
    return new URL(origin).host === req.headers.get('host')
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  // Sans JavaScript : redirection 303 vers une page de résultat. L'en-tête Location est
  // relatif pour rester sur le domaine visité (compatible avec la CSP form-action 'self').
  const reply = (status: number, body: Record<string, unknown>, redirectTo: string) =>
    isJson
      ? NextResponse.json(body, { status })
      : new NextResponse(null, { status: 303, headers: { Location: redirectTo } })

  if (!isSameOrigin(req)) return reply(403, { ok: false, message: 'Origine non autorisée.' }, '/envoi-impossible')
  if (isRateLimited(clientIp(req))) {
    return reply(429, { ok: false, message: `Trop de demandes envoyées. ${FAILURE_MESSAGE}` }, '/envoi-impossible')
  }

  // Lecture du corps avec une taille maximale.
  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) {
    return reply(413, { ok: false, message: 'Demande trop volumineuse.' }, '/envoi-impossible')
  }

  let input: Record<string, unknown>
  try {
    if (isJson) {
      input = JSON.parse(raw)
    } else {
      const params = new URLSearchParams(raw)
      input = Object.fromEntries(params)
      input.services = params.getAll('services')
    }
  } catch {
    return reply(400, { ok: false, message: 'Requête invalide.' }, '/envoi-impossible')
  }

  // Anti-spam : champ piège rempli, ou formulaire envoyé trop vite après son affichage.
  // On répond « succès » sans rien transmettre pour ne pas renseigner les robots.
  const honeypot = typeof input.website === 'string' && input.website.trim() !== ''
  const startedAt = Number(input.startedAt)
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_TIME_MS
  if (honeypot || tooFast) {
    console.warn('[demande] Envoi ignoré (anti-spam)', { honeypot, tooFast })
    return reply(200, { ok: true }, '/merci')
  }

  const data = sanitize(input)
  const errors = validate(data)
  if (Object.keys(errors).length > 0) {
    return reply(422, { ok: false, errors, message: 'Certains champs sont à corriger.' }, '/envoi-impossible')
  }

  const result = await deliverRequest(data)
  if (!result.ok) {
    return reply(502, { ok: false, message: FAILURE_MESSAGE }, '/envoi-impossible')
  }

  return reply(200, { ok: true }, '/merci')
}
