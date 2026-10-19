import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublishedServiceSlugs, getService, getSiteChrome } from '@/backend/modules/content/public'
import { pageMetadata } from '@/frontend/lib/seo'
import { ServiceView } from '@/frontend/views/site/ServiceView'

type Props = { params: Promise<{ slug: string }> }

// Prestations publiées prérendues au déploiement ; une prestation créée ensuite
// depuis le back-office est rendue à la première visite puis mise en cache.
export async function generateStaticParams() {
  return (await getPublishedServiceSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [service, { settings }] = await Promise.all([getService(slug), getSiteChrome()])
  if (!service) return {}
  return pageMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: `/prestations/${service.slug}`,
    siteName: settings.companyName,
  })
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const [service, chrome] = await Promise.all([getService(slug), getSiteChrome()])
  if (!service) notFound()
  return <ServiceView service={service} settings={chrome.settings} claims={chrome.claims} />
}
