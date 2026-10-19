// ============================================================================
// Proxy (exécuté avant le rendu) — redirection rapide vers la page de connexion
// quand aucun cookie de session n'est présent.
// Ce n'est PAS la protection du back-office : chaque page, action et route
// vérifie la session et les droits côté serveur (backend/modules/auth/guard.ts).
// ============================================================================
import { NextResponse, type NextRequest } from 'next/server'

// Noms du cookie en production (préfixe __Host-) et en développement.
const SESSION_COOKIES = ['__Host-gam_admin', 'gam_admin']

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (pathname === '/admin/connexion') return NextResponse.next()

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name))
  if (hasSession) return NextResponse.next()

  const login = new URL('/admin/connexion', request.url)
  if (pathname !== '/admin') login.searchParams.set('suite', `${pathname}${search}`)
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ['/admin/:path*'],
}
