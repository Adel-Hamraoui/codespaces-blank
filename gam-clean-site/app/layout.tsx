// ============================================================================
// Document HTML commun au site public et au back-office.
// L'habillage du site public est dans app/(site)/layout.tsx, celui du
// back-office dans app/admin/layout.tsx.
// ============================================================================
import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { getSiteUrl } from '@/shared/config/site-url'
import '@/frontend/styles/globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport: Viewport = {
  themeColor: '#0a2342',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={manrope.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  )
}
