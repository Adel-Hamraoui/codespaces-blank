import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { addLeadNoteAction, assignLeadAction, deleteLeadAction, updateLeadStatusAction } from '@/backend/actions/leads'
import { createInvitationAction } from '@/backend/actions/reviews'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { getLead } from '@/backend/modules/leads/repository'
import { listAssignableUsers } from '@/backend/modules/users/repository'
import { LeadView } from '@/frontend/views/admin/LeadView'
import { can } from '@/shared/auth/permissions'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Demande n° ${(await params).id}` }
}

export default async function LeadPage({ params }: Props) {
  const { user } = await requireAdmin('manageLeads')
  const { id } = await params
  const sql = requireSql()
  const [lead, assignees] = await Promise.all([getLead(sql, id), listAssignableUsers(sql)])
  if (!lead) notFound()
  return (
    <LeadView
      lead={lead}
      assignees={assignees}
      canDelete={can(user, 'deleteLeads')}
      now={Date.now()}
      actions={{
        updateStatus: updateLeadStatusAction,
        assign: assignLeadAction,
        addNote: addLeadNoteAction,
        createInvitation: createInvitationAction,
        deleteLead: deleteLeadAction,
      }}
    />
  )
}
