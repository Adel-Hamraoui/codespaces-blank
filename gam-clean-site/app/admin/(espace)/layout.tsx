import { logoutAction } from '@/backend/actions/auth'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { getSiteChrome } from '@/backend/modules/content/public'
import { countNewLeads } from '@/backend/modules/leads/repository'
import { countReviewsByStatus } from '@/backend/modules/reviews/repository'
import { AdminShell } from '@/frontend/components/admin/AdminShell'

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin(undefined, { allowPendingPassword: true })
  const sql = requireSql()
  const [newLeads, reviews, { settings }] = await Promise.all([countNewLeads(sql), countReviewsByStatus(sql), getSiteChrome()])
  return (
    <AdminShell
      brandName={settings.companyName}
      user={user}
      counts={{ newLeads, pendingReviews: reviews.pending }}
      logoutAction={logoutAction}
    >
      {children}
    </AdminShell>
  )
}
