// ============================================================================
// Filtres de la liste des demandes, lus depuis l'URL (liens partageables).
// ============================================================================
import { LEAD_STATUSES, LEAD_TYPES } from '../constants'
import type { LeadFilters } from '../types/admin'
import { isOneOf } from './common'

type Params = Record<string, string | string[] | undefined> | URLSearchParams

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function get(params: Params, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined
  const v = params[key]
  return Array.isArray(v) ? v[0] : v
}

export function parseLeadFilters(params: Params): LeadFilters {
  const status = get(params, 'statut')
  const type = get(params, 'type')
  const service = Number(get(params, 'prestation'))
  const assigned = Number(get(params, 'assigne'))
  const q = get(params, 'q')?.trim().slice(0, 80)
  const from = get(params, 'du')
  const to = get(params, 'au')
  return {
    status: isOneOf(LEAD_STATUSES, status) ? status : undefined,
    type: isOneOf(LEAD_TYPES, type) ? type : undefined,
    serviceId: Number.isInteger(service) && service > 0 ? service : undefined,
    assignedToId: Number.isInteger(assigned) && assigned > 0 ? assigned : undefined,
    q: q && q.length >= 2 ? q : undefined,
    from: from && DATE_RE.test(from) ? from : undefined,
    to: to && DATE_RE.test(to) ? to : undefined,
  }
}

/** Filtres → paramètres d'URL (pour les liens de pagination et d'export). */
export function filtersToQuery(f: LeadFilters, extra: Record<string, string> = {}) {
  const p = new URLSearchParams()
  if (f.status) p.set('statut', f.status)
  if (f.type) p.set('type', f.type)
  if (f.serviceId) p.set('prestation', String(f.serviceId))
  if (f.assignedToId) p.set('assigne', String(f.assignedToId))
  if (f.q) p.set('q', f.q)
  if (f.from) p.set('du', f.from)
  if (f.to) p.set('au', f.to)
  for (const [k, v] of Object.entries(extra)) p.set(k, v)
  const s = p.toString()
  return s ? `?${s}` : ''
}
