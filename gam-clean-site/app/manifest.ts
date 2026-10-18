import type { MetadataRoute } from 'next'
import { getSiteChrome } from '@/backend/modules/content/public'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { settings } = await getSiteChrome()
  return {
    name: `${settings.companyName} — Nettoyage professionnel`,
    short_name: settings.companyName,
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#0a2342',
    lang: 'fr',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
