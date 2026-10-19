import type { Metadata } from 'next'
import { createUserAction, resetPasswordAction, updateUserAction } from '@/backend/actions/users'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { listUsers } from '@/backend/modules/users/repository'
import { UsersView } from '@/frontend/views/admin/UsersView'

// Page protégée : elle vérifie la session avant de s'afficher (navigation bloquante assumée).
export const instant = false

export const metadata: Metadata = { title: 'Utilisateurs' }

export default async function UsersPage() {
  const { user } = await requireAdmin('manageUsers')
  const users = await listUsers(requireSql())
  return (
    <UsersView
      users={users}
      currentUserId={user.id}
      now={Date.now()}
      actions={{ create: createUserAction, update: updateUserAction, resetPassword: resetPasswordAction }}
    />
  )
}
