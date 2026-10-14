// ============================================================================
// Envoi des demandes par e-mail via l'API HTTP de Resend (aucun SDK requis).
// Exécuté uniquement côté serveur : la clé API n'est jamais exposée au navigateur.
// ============================================================================
import { company } from '@/content/site'
import { serviceLabel, type RequestData } from './request-schema'

export type DeliveryResult = { ok: true } | { ok: false; reason: 'not_configured' | 'provider_error' }

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

function rows(d: RequestData): [string, string][] {
  const r: [string, string][] = [
    ['Type de demande', d.type === 'devis' ? 'Demande de devis' : 'Message de contact'],
    ['Nom', d.name],
    ['Société', d.company],
    ['Téléphone', d.phone],
    ['E-mail', d.email],
    ['Profil', d.profile],
    ['Prestations', d.services.map(serviceLabel).join(', ')],
    ['Fréquence', d.frequency],
    ['Ville / code postal des locaux', d.location],
    ['Surface approximative', d.surface],
    ['Message', d.message],
  ]
  return r.filter(([, v]) => v)
}

function renderText(d: RequestData) {
  return rows(d)
    .map(([k, v]) => `${k} : ${v}`)
    .join('\n')
}

function renderHtml(d: RequestData) {
  const lines = rows(d)
    .map(
      ([k, v]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top;color:#475569;font-weight:600">${escapeHtml(k)}</th><td style="padding:6px 0;color:#0b1b2b">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`
    )
    .join('')
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><h2 style="color:#0a2342">${
    d.type === 'devis' ? 'Nouvelle demande de devis' : 'Nouveau message'
  } — site ${company.name}</h2><table cellpadding="0" cellspacing="0">${lines}</table><p style="color:#475569;font-size:13px">Répondez directement à cet e-mail pour écrire au demandeur.</p></div>`
}

async function sendEmail(payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) {
    // Journal serveur uniquement (visible dans les logs Vercel), jamais renvoyé au visiteur.
    console.error('[demande] Resend a refusé l’envoi', res.status, (await res.text()).slice(0, 300))
  }
  return res.ok
}

export async function deliverRequest(d: RequestData): Promise<DeliveryResult> {
  // Mode développement : affiche la demande dans le terminal, sans rien envoyer.
  if (process.env.CONTACT_DELIVERY_MODE === 'log' && process.env.NODE_ENV !== 'production') {
    console.info('[demande] (mode log, rien n’est envoyé)\n' + renderText(d))
    return { ok: true }
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[demande] RESEND_API_KEY absente : la demande ne peut pas être transmise.')
    return { ok: false, reason: 'not_configured' }
  }

  const to = process.env.CONTACT_TO_EMAIL || company.email
  const from = process.env.CONTACT_FROM_EMAIL || `${company.name} <onboarding@resend.dev>`
  const subject =
    d.type === 'devis'
      ? `Demande de devis — ${d.name}${d.location ? ` (${d.location})` : ''}`
      : `Message — ${d.name}`

  try {
    const sent = await sendEmail({
      from,
      to: [to],
      reply_to: d.email,
      subject,
      text: renderText(d),
      html: renderHtml(d),
    })
    if (!sent) return { ok: false, reason: 'provider_error' }

    // Accusé de réception au demandeur (optionnel, nécessite un domaine vérifié chez Resend).
    if (process.env.SEND_CUSTOMER_CONFIRMATION === 'true') {
      await sendEmail({
        from,
        to: [d.email],
        reply_to: to,
        subject: `${company.name} — nous avons bien reçu votre demande`,
        text: `Bonjour ${d.name},\n\nNous avons bien reçu votre demande et revenons vers vous ${company.responseTime ?? 'dès que possible'}.\nPour toute précision : ${company.phone.display}.\n\n${company.name}`,
      }).catch(() => false)
    }
    return { ok: true }
  } catch (err) {
    console.error('[demande] Erreur réseau lors de l’envoi', err)
    return { ok: false, reason: 'provider_error' }
  }
}
