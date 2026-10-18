import type { MetadataRoute } from 'next'
import { absoluteUrl, isIndexable } from '@/shared/config/site-url'

export default function robots(): MetadataRoute.Robots {
  // Les déploiements de prévisualisation Vercel ne doivent pas être indexés.
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    // Back-office, API et liens personnels d'avis : jamais explorés.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/avis/'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
