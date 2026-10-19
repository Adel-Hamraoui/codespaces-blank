import type { MetadataRoute } from 'next'
import { getPublishedServiceSlugs } from '@/backend/modules/content/public'
import { absoluteUrl } from '@/shared/config/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedServiceSlugs()
  const paths = [
    '/',
    '/prestations',
    ...slugs.map((slug) => `/prestations/${slug}`),
    '/secteurs',
    '/a-propos',
    '/devis',
    '/contact',
    '/faq',
    '/mentions-legales',
    '/politique-de-confidentialite',
  ]
  return paths.map((path) => ({ url: absoluteUrl(path) }))
}
