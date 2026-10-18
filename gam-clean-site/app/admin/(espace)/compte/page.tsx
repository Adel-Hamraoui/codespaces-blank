import type { Metadata } from 'next'
import { changePasswordAction } from '@/backend/actions/auth'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { AccountView } from '@/frontend/views/admin/AccountView'

export const metadata: Metadata = { title: 'Mon compte' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function AccountPage({ searchParams }: Props) {
  const { user } = await requireAdmin(undefined, { allowPendingPassword: true })
  const sp = await searchParams
  return <AccountView user={user} firstLogin={user.mustChangePassword || sp.premiere === '1'} action={changePasswordAction} />
}
