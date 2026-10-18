// ============================================================================
// POST /api/demande — réception des demandes de devis et de contact.
// Accepte du JSON (formulaire avec JavaScript) ou un envoi de formulaire HTML
// classique (navigateur sans JavaScript : redirection vers /merci).
// La logique métier (anti-abus, validation, enregistrement, e-mail) est dans
// backend/modules/leads/service.ts : cette route ne fait que le transport HTTP.
// ============================================================================
import { NextResponse, type NextRequest } from 'next/server'
import { getSiteChrome } from '@/backend/modules/content/public'
import { submitLead } from '@/backend/modules/leads/service'
import { clientIp } from '@/backend/security/rate-limit'

const MAX_BODY_BYTES = 20_000

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
  const isJson = (req.headers.get('content-type') ?? '').includes('application/json')

  // Sans JavaScript : redirection 303 vers une page de résultat. L'en-tête Location est
  // relatif pour rester sur le domaine visité (compatible avec la CSP form-action 'self').
  const reply = (status: number, body: Record<string, unknown>, redirectTo: string) =>
    isJson
      ? NextResponse.json(body, { status })
      : new NextResponse(null, { status: 303, headers: { Location: redirectTo } })

  if (!isSameOrigin(req)) return reply(403, { ok: false, message: 'Origine non autorisée.' }, '/envoi-impossible')

  // Taille maximale : vérifiée sur l'en-tête puis sur le corps réellement reçu.
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return reply(413, { ok: false, message: 'Demande trop volumineuse.' }, '/envoi-impossible')
  }
  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) {
    return reply(413, { ok: false, message: 'Demande trop volumineuse.' }, '/envoi-impossible')
  }

  let input: Record<string, unknown>
  try {
    if (isJson) {
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('format')
      input = parsed as Record<string, unknown>
    } else {
      const params = new URLSearchParams(raw)
      input = Object.fromEntries(params)
      input.services = params.getAll('services')
    }
  } catch {
    return reply(400, { ok: false, message: 'Requête invalide.' }, '/envoi-impossible')
  }

  const result = await submitLead(input, { ip: clientIp(req.headers) })
  const type = input.type === 'contact' ? 'contact' : 'devis'

  switch (result.status) {
    case 'ok':
    case 'spam': // réponse identique pour ne pas renseigner les robots
      return reply(200, { ok: true }, `/merci?demande=${type}`)
    case 'invalid':
      return reply(422, { ok: false, errors: result.errors, message: 'Certains champs sont à corriger.' }, '/envoi-impossible')
    case 'rate_limited':
    case 'failed': {
      const { settings } = await getSiteChrome()
      const contact = `Appelez-nous au ${settings.phone.display} ou écrivez-nous à ${settings.email}.`
      return result.status === 'rate_limited'
        ? reply(429, { ok: false, message: `Trop de demandes envoyées depuis votre connexion. ${contact}` }, '/envoi-impossible')
        : reply(502, { ok: false, message: `Votre demande n’a pas pu être transmise. ${contact}` }, '/envoi-impossible')
    }
  }
}
