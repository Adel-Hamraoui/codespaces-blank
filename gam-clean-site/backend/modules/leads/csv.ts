// ============================================================================
// Export CSV des demandes, lisible directement dans Excel (France) :
// séparateur « ; », BOM UTF-8, et neutralisation des formules (injection CSV).
// ============================================================================
import 'server-only'
import { FREQUENCIES, LEAD_STATUSES, LEAD_TYPES, PROFILES, labelOf } from '@/shared/constants'
import { formatPhone } from '@/shared/validation/common'
import type { exportLeads } from './repository'

type ExportRow = Awaited<ReturnType<typeof exportLeads>>[number]

/** Une cellule commençant par = + - @ (ou tabulation) serait interprétée comme une formule : on la neutralise. */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(d)

export function leadsToCsv(rows: ExportRow[]): string {
  const header = [
    'N°', 'Date', 'Type', 'Statut', 'Nom', 'Société', 'E-mail', 'Téléphone', 'Ville / CP',
    'Prestations', 'Fréquence', 'Profil', 'Surface (m²)', 'Assignée à', 'Message',
  ]
  const lines = rows.map((r) =>
    [
      r.id,
      fmtDate(r.createdAt),
      labelOf(LEAD_TYPES, r.type),
      labelOf(LEAD_STATUSES, r.status),
      r.name,
      r.company,
      r.email,
      formatPhone(r.phone),
      r.location,
      [...r.serviceNames, ...(r.otherNeed ? ['Autre besoin'] : [])].join(', '),
      labelOf(FREQUENCIES, r.frequency),
      labelOf(PROFILES, r.profile),
      r.surfaceM2,
      r.assignedTo,
      r.message,
    ]
      .map(csvCell)
      .join(';')
  )
  return '﻿' + [header.map(csvCell).join(';'), ...lines].join('\r\n')
}
