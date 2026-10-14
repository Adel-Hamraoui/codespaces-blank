'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { track } from '@/lib/analytics'

/**
 * - Charge le script du fournisseur de mesure d'audience s'il est configuré.
 * - Écoute les clics de tout le site (délégation) :
 *   liens tel:, mailto:, et éléments portant data-track="cta_devis_click".
 */
export function Analytics() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      const el = target?.closest<HTMLElement>('a, button')
      if (!el) return
      const location = el.dataset.trackLocation ?? 'inconnu'
      const href = el.getAttribute('href') ?? ''
      if (href.startsWith('tel:')) track('phone_click', { location })
      else if (href.startsWith('mailto:')) track('email_click', { location })
      else if (el.dataset.track === 'cta_devis_click') track('cta_devis_click', { location })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  if (provider === 'vercel') {
    return (
      <>
        <Script id="va-queue" strategy="afterInteractive">
          {'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};'}
        </Script>
        <Script src="/_vercel/insights/script.js" strategy="lazyOnload" />
      </>
    )
  }

  if (provider === 'plausible' && plausibleDomain) {
    return (
      <>
        <Script id="plausible-queue" strategy="afterInteractive">
          {'window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)};'}
        </Script>
        <Script src="https://plausible.io/js/script.js" data-domain={plausibleDomain} strategy="lazyOnload" />
      </>
    )
  }

  return null
}
