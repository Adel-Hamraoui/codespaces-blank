import { logoutAction } from '@/backend/actions/auth'
import { getSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { getSiteChrome } from '@/backend/modules/content/public'
import { countNewLeads } from '@/backend/modules/leads/repository'
import { countReviewsByStatus } from '@/backend/modules/reviews/repository'
import { AdminShell } from '@/frontend/components/admin/AdminShell'

// La session est vérifiée avant tout affichage : entrer dans cet espace peut attendre
// le serveur. Les changements de page à l'intérieur restent immédiats (loading.tsx).
export const instant = false

/** Compteurs du menu : ils ne dépendent pas de l'utilisateur connecté. */
async function menuCounts() {
  const sql = getSql()
  if (!sql) return { newLeads: 0, pendingReviews: 0 }
  const [newLeads, reviews] = await Promise.all([countNewLeads(sql), countReviewsByStatus(sql)])
  return { newLeads, pendingReviews: reviews.pending }
}

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  // Session et compteurs en parallèle (un aller-retour de moins vers la base). Si la
  // session est invalide, requireAdmin redirige et les compteurs ne sont jamais affichés.
  const [{ user }, counts, { settings }] = await Promise.all([
    requireAdmin(undefined, { allowPendingPassword: true }),
    menuCounts(),
    getSiteChrome(),
  ])
  return (
    <AdminShell brandName={settings.companyName} user={user} counts={counts} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  )
}
