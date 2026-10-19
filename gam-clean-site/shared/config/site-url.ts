// ============================================================================
// URL publique et indexation — lues dans l'environnement (build ou serveur).
// ============================================================================

/**
 * URL publique du site, sans slash final.
 * Priorité : NEXT_PUBLIC_SITE_URL > domaine de production Vercel > localhost.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProd) return `https://${vercelProd}`
  return 'http://localhost:3000'
}

/** Seul le déploiement de production est indexable (les prévisualisations Vercel ne le sont pas). */
export function isIndexable(): boolean {
  const env = process.env.VERCEL_ENV
  return env === undefined || env === 'production'
}

export const absoluteUrl = (path: string) => `${getSiteUrl()}${path === '/' ? '' : path}`
