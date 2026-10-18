// ============================================================================
// Envoi d'e-mails transactionnels via l'API HTTP de Resend (sans SDK).
// Exécuté uniquement côté serveur : la clé API n'est jamais exposée.
// ============================================================================
import 'server-only'
import { config } from '../config/env'
import { FREQUENCIES, PROFILES, labelOf } from '@/shared/constants'
import type { SiteSettings } from '@/shared/types/content'
import { formatPhone } from '@/shared/validation/common'
import type { ValidRequest } from '@/shared/validation/request'

export type EmailResult = { sent: boolean; reason?: 'not_configured' | 'provider_error' | 'logged' }

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

async function send(payload: Record<string, unknown>): Promise<EmailResult> {
  if (config.deliveryMode === 'log') {
    console.info('[e-mail] (mode log, rien n’est envoyé)\n' + JSON.stringify({ to: payload.to, subject: payload.subject }, null, 2) + '\n' + payload.text)
    return { sent: true, reason: 'logged' }
  }
  if (!config.resendApiKey) {
    console.error('[e-mail] RESEND_API_KEY absente : e-mail non envoyé.')
    return { sent: false, reason: 'not_configured' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      console.error('[e-mail] Resend a refusé l’envoi', res.status, (await res.text()).slice(0, 300))
      return { sent: false, reason: 'provider_error' }
    }
    return { sent: true }
  } catch (error) {
    console.error('[e-mail] Erreur réseau', error)
    return { sent: false, reason: 'provider_error' }
  }
}

const from = (s: SiteSettings) => config.contactFromEmail || `${s.companyName} <onboarding@resend.dev>`

function table(rows: [string, string][]) {
  return `<table cellpadding="0" cellspacing="0">${rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top;color:#475569;font-weight:600">${escapeHtml(k)}</th><td style="padding:6px 0;color:#0b1b2b">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`
    )
    .join('')}</table>`
}

/** Notification interne d'une nouvelle demande. */
export async function notifyNewLead(d: ValidRequest, serviceNames: string[], s: SiteSettings, adminUrl: string | null) {
  const rows: [string, string][] = [
    ['Type', d.type === 'devis' ? 'Demande de devis' : 'Message de contact'],
    ['Nom', d.name],
    ['Société', d.company],
    ['Téléphone', formatPhone(d.phoneE164)],
    ['E-mail', d.email],
    ['Profil', labelOf(PROFILES, d.profile)],
    ['Prestations', [...serviceNames, ...(d.otherNeed ? ['Autre besoin'] : [])].join(', ')],
    ['Fréquence', labelOf(FREQUENCIES, d.frequency)],
    ['Ville / code postal', d.location],
    ['Surface', d.surfaceM2 ? `${d.surfaceM2} m²` : ''],
    ['Message', d.message],
    ['Page d’origine', d.sourcePath],
  ]
  const subject = d.type === 'devis' ? `Demande de devis — ${d.name}${d.location ? ` (${d.location})` : ''}` : `Message — ${d.name}`
  const link = adminUrl ? `<p><a href="${escapeHtml(adminUrl)}" style="color:#1747a6">Ouvrir la demande dans le back-office</a></p>` : ''
  return send({
    from: from(s),
    to: [config.contactToEmail || s.email],
    reply_to: d.email,
    subject,
    text: rows.filter(([, v]) => v).map(([k, v]) => `${k} : ${v}`).join('\n') + (adminUrl ? `\n\nBack-office : ${adminUrl}` : ''),
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><h2 style="color:#0a2342">${escapeHtml(subject)}</h2>${table(rows)}${link}<p style="color:#475569;font-size:13px">Répondez directement à cet e-mail pour écrire au demandeur.</p></div>`,
  })
}

/** Accusé de réception au demandeur (optionnel, nécessite un domaine vérifié chez Resend). */
export async function sendCustomerConfirmation(d: ValidRequest, s: SiteSettings) {
  if (!config.sendCustomerConfirmation) return { sent: false } as EmailResult
  return send({
    from: from(s),
    to: [d.email],
    reply_to: config.contactToEmail || s.email,
    subject: `${s.companyName} — nous avons bien reçu votre demande`,
    text: `Bonjour ${d.name},\n\nNous avons bien reçu votre demande et revenons vers vous ${s.responseTime ?? 'dès que possible'}.\nPour toute précision : ${s.phone.display}.\n\n${s.companyName}`,
  })
}

/** Invitation à laisser un avis (lien personnel à usage unique). */
export async function sendReviewInvitation(to: string, clientName: string, link: string, s: SiteSettings) {
  const text = `Bonjour ${clientName},\n\nMerci d’avoir fait appel à ${s.companyName}. Votre avis nous aide à progresser : il ne prend qu’un instant.\n\nDonner mon avis : ${link}\n\nCe lien est personnel et utilisable une seule fois.\n\n${s.companyName} — ${s.phone.display}`
  return send({
    from: from(s),
    to: [to],
    reply_to: config.contactToEmail || s.email,
    subject: `${s.companyName} — votre avis sur notre intervention`,
    text,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0b1b2b"><p>Bonjour ${escapeHtml(clientName)},</p><p>Merci d’avoir fait appel à ${escapeHtml(s.companyName)}. Votre avis nous aide à progresser : il ne prend qu’un instant.</p><p><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#0b7a4b;color:#fff;text-decoration:none;font-weight:bold">Donner mon avis</a></p><p style="color:#475569;font-size:13px">Ce lien est personnel et utilisable une seule fois.</p></div>`,
  })
}
