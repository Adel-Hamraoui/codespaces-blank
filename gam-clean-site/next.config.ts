import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'
const analytics = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER

// Plausible est servi depuis un domaine tiers : on l'autorise uniquement s'il est activé.
const analyticsHosts = analytics === 'plausible' ? ' https://plausible.io' : ''

// Content-Security-Policy.
// - Les pages sont générées statiquement : Next.js injecte de petits scripts inline
//   d'hydratation, d'où 'unsafe-inline' sur script-src (un nonce obligerait à rendre
//   chaque page dynamiquement, au détriment des performances).
// - Aucun script, police ou iframe tiers n'est chargé par défaut.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}${analyticsHosts}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${analyticsHosts}${isDev ? ' ws: wss:' : ''}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Pages publiques statiques (contenus mis en cache avec « use cache » et
  // invalidés depuis le back-office), back-office rendu à la demande.
  cacheComponents: true,
  // Préchargement complet des pages (toutes statiques côté public). Le mode
  // « partiel » servirait d'abord une coque générique aux adresses inconnues :
  // une prestation inexistante répondrait 200 au lieu d'une vraie erreur 404.
  partialPrefetching: false,
  // Pilote PostgreSQL chargé tel quel par Node.js (pas d'empaquetage).
  serverExternalPackages: ['postgres'],
  experimental: {
    // CSS intégré au HTML : supprime les requêtes CSS bloquantes au premier affichage
    // (la majorité des visiteurs d'un site vitrine arrivent pour la première fois).
    inlineCss: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 80],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Les réponses de l'API ne doivent jamais être mises en cache.
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        // Back-office : jamais indexé, jamais transmis en référent.
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        source: '/avis/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ]
  },
  async redirects() {
    // Correspondance avec les URL de l'ancien site (Genspark) pour ne pas perdre
    // de liens existants. Redirections permanentes (308).
    return [
      { source: '/services', destination: '/prestations', permanent: true },
      { source: '/qui-sommes-nous', destination: '/a-propos', permanent: true },
      { source: '/notre-methode', destination: '/a-propos#methode', permanent: true },
      { source: '/nos-engagements', destination: '/a-propos', permanent: true },
      { source: '/references', destination: '/a-propos', permanent: true },
      { source: '/nous-localiser', destination: '/contact', permanent: true },
    ]
  },
}

export default nextConfig
