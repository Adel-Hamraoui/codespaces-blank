// ============================================================================
// Dépôt d'un avis client via un lien personnel (/avis/<jeton>).
// Le cadre de la page est statique ; la vérification du jeton se fait à la
// demande, dans la zone <Suspense>. Page jamais indexée.
// ============================================================================
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { submitReviewAction } from '@/backend/actions/reviews'
import { getSiteChrome } from '@/backend/modules/content/public'
import { getOpenInvitation } from '@/backend/modules/reviews/service'
import { PageHero } from '@/frontend/components/sections/PageHero'
import { ReviewSkeleton, ReviewView } from '@/frontend/views/site/ReviewView'

type Props = { params: Promise<{ jeton: string }> }

export const metadata: Metadata = {
  title: 'Votre avis',
  robots: { index: false, follow: false },
}

export default function AvisPage({ params }: Props) {
  return (
    <>
      <PageHero kicker="Avis client" title="Votre avis sur notre intervention" />
      <section className="section">
        <div className="container">
          <Suspense fallback={<ReviewSkeleton />}>
            <Invitation params={params} />
          </Suspense>
        </div>
      </section>
    </>
  )
}

async function Invitation({ params }: Props) {
  const { jeton } = await params
  const [{ settings, services }, invitation] = await Promise.all([getSiteChrome(), getOpenInvitation(jeton)])
  return (
    <ReviewView
      settings={settings}
      services={services.map(({ slug, name }) => ({ slug, name }))}
      invitation={invitation && { clientName: invitation.clientName, serviceSlugs: invitation.leadServiceSlugs }}
      action={submitReviewAction.bind(null, jeton)}
    />
  )
}
