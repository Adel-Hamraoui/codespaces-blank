import type { Metadata } from 'next'
import {
  createInvitationAction,
  deleteInvitationAction,
  deleteReviewAction,
  moderateReviewAction,
} from '@/backend/actions/reviews'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { countReviewsByStatus, listRequests, listReviews } from '@/backend/modules/reviews/repository'
import { ReviewsView } from '@/frontend/views/admin/ReviewsView'
import { REVIEW_STATUSES } from '@/shared/constants'
import { isOneOf } from '@/shared/validation/common'

// Page protégée : elle vérifie la session avant de s'afficher (navigation bloquante assumée).
export const instant = false

export const metadata: Metadata = { title: 'Avis clients' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ReviewsPage({ searchParams }: Props) {
  await requireAdmin('moderateReviews')
  const sql = requireSql()
  const { statut } = await searchParams
  const status = isOneOf(REVIEW_STATUSES, statut) ? statut : null
  const [reviews, counts, requests] = await Promise.all([
    listReviews(sql, status),
    countReviewsByStatus(sql),
    listRequests(sql),
  ])
  return (
    <ReviewsView
      reviews={reviews}
      status={status}
      counts={counts}
      requests={requests}
      now={Date.now()}
      actions={{
        moderate: moderateReviewAction,
        remove: deleteReviewAction,
        invite: createInvitationAction,
        cancelInvitation: deleteInvitationAction,
      }}
    />
  )
}
