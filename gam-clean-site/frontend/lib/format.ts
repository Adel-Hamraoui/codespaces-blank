// ============================================================================
// Mise en forme pour l'affichage (français, fuseau Europe/Paris).
// ============================================================================

export const TO_CONFIRM = '[À confirmer avec GAM CLEAN]'

export const formatSiret = (s: string) => s.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1 $2 $3 $4')

export const capitalize = (s: string) => (s ? `${s.charAt(0).toUpperCase()}${s.slice(1)}` : s)

const TZ = 'Europe/Paris'
const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: TZ })
const shortDateFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ })
const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ })
const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: TZ })

export const formatDate = (iso: string) => dateFmt.format(new Date(iso))
export const formatShortDate = (iso: string) => shortDateFmt.format(new Date(iso))
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso))
export const formatMonth = (iso: string) => monthFmt.format(new Date(iso))

const rtf = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })

/** « il y a 3 heures », « hier »… par rapport à `now` (fourni par l'appelant). */
export function formatRelative(iso: string, now: number): string {
  const diff = (new Date(iso).getTime() - now) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return 'à l’instant'
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day')
  return formatShortDate(iso)
}

export const plural = (n: number, one: string, many: string) => `${n.toLocaleString('fr-FR')} ${n > 1 ? many : one}`
