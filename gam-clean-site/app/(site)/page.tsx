import { getGeneralFaq, getPublishedReviews, getSectors, getSiteChrome } from '@/backend/modules/content/public'
import { homeTitle, siteDescription } from '@/frontend/config/site'
import { isConfirmed } from '@/frontend/lib/claims'
import { pageMetadata } from '@/frontend/lib/seo'
import { HomeView } from '@/frontend/views/site/HomeView'

export async function generateMetadata() {
  const { settings, claims } = await getSiteChrome()
  return pageMetadata({
    title: homeTitle(settings),
    absoluteTitle: true,
    description: siteDescription(settings, isConfirmed(claims, 'freeQuote')),
    path: '/',
    siteName: settings.companyName,
  })
}

export default async function HomePage() {
  const [chrome, faq, sectors, reviews] = await Promise.all([
    getSiteChrome(),
    getGeneralFaq(),
    getSectors(),
    getPublishedReviews(),
  ])
  return <HomeView chrome={chrome} faq={faq.slice(0, 5)} sectors={sectors} reviews={reviews} />
}
