import type { MetadataRoute } from 'next'
import { services } from '@/content/services'
import { absoluteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/prestations',
    ...services.map((s) => `/prestations/${s.slug}`),
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
