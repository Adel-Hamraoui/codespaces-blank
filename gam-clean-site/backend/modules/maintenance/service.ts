// ============================================================================
// Maintenance quotidienne (tâche planifiée Vercel Cron) :
//   1. purge RGPD et hygiène (gam.purge_expired_data) ;
//   2. nouvel essai d'envoi des notifications e-mail en échec.
// ============================================================================
import 'server-only'
import { getSql } from '../../db/client'
import { notifyNewLead } from '../../integrations/email'
import { getSiteChrome } from '../content/public'
import { leadForNotification, pendingNotifications, recordNotification } from '../leads/repository'
import { audit } from '../audit/log'
import { absoluteUrl } from '@/shared/config/site-url'

export async function runMaintenance() {
  const sql = getSql()
  if (!sql) return { ok: false, reason: 'database_not_configured' }

  const [{ result: purge }] = await sql<{ result: Record<string, number> }[]>`select gam.purge_expired_data() as result`

  const chrome = await getSiteChrome()
  let retried = 0
  let sent = 0
  for (const { id } of await pendingNotifications(sql)) {
    const lead = await leadForNotification(sql, id)
    if (!lead) continue
    retried += 1
    const names = chrome.services.filter((s) => lead.serviceSlugs.includes(s.slug)).map((s) => s.name)
    const mail = await notifyNewLead(lead, names, chrome.settings, absoluteUrl(`/admin/demandes/${id}`))
    await recordNotification(sql, id, mail.sent)
    if (mail.sent) sent += 1
  }

  await audit(sql, null, 'maintenance.run', {}, { purge, retried, sent })
  return { ok: true, purge, notifications: { retried, sent } }
}
