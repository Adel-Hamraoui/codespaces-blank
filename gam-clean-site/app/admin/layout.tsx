// ============================================================================
// Back-office : rendu à chaque requête (session lue dans le cookie), jamais
// indexé. Les pages vérifient elles-mêmes la session et les droits.
// ============================================================================
import type { Metadata } from 'next'

// Pages personnelles, toujours rendues à la demande : pas de coque statique attendue.
export const instant = false

export const metadata: Metadata = {
  title: { default: 'Back-office', template: '%s · Back-office' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
