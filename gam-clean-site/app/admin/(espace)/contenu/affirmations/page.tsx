import type { Metadata } from 'next'
import { updateClaimAction } from '@/backend/actions/content'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { listClaimsAdmin } from '@/backend/modules/content/repository'
import { ClaimsView } from '@/frontend/views/admin/ClaimsView'

export const metadata: Metadata = { title: 'Affirmations commerciales' }

export default async function ClaimsPage() {
  await requireAdmin('editContent')
  const claims = await listClaimsAdmin(requireSql())
  return <ClaimsView claims={claims.map(({ updatedAt: _u, ...c }) => c)} action={updateClaimAction} />
}
