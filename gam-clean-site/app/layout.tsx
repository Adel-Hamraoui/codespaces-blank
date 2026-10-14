import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileActionBar } from '@/components/layout/MobileActionBar'
import { Analytics } from '@/components/analytics/Analytics'
import { JsonLd } from '@/components/seo/JsonLd'
import { company } from '@/content/site'
import { getSiteUrl, isIndexable, localBusinessJsonLd } from '@/lib/seo'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'GAM CLEAN — Entreprise de nettoyage professionnel à Bondy (93)',
    template: `%s | ${company.name}`,
  },
  description:
    'Nettoyage de bureaux, commerces, sites industriels, vitres, fin de chantier et remise en état. Basés à Bondy (93), en Île-de-France. Devis gratuit.',
  applicationName: company.name,
  formatDetection: { telephone: false, email: false, address: false },
  robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: company.name,
  },
}

export const viewport: Viewport = {
  themeColor: '#0a2342',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={manrope.variable} data-scroll-behavior="smooth">
      <body>
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <Header />
        <main id="contenu" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <MobileActionBar />
        <JsonLd data={localBusinessJsonLd()} />
        <Analytics />
      </body>
    </html>
  )
}
