import type { MetadataRoute } from 'next'
import { company } from '@/content/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${company.name} — Nettoyage professionnel`,
    short_name: company.name,
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
