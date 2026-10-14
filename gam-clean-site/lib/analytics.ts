// ============================================================================
// Mesure des conversions — couche d'abstraction légère, sans dépendance.
// Le fournisseur se choisit avec NEXT_PUBLIC_ANALYTICS_PROVIDER ("vercel" ou
// "plausible"). Sans fournisseur, les appels sont ignorés.
// ============================================================================

export type ConversionEvent =
  | 'cta_devis_click'
  | 'phone_click'
  | 'email_click'
  | 'form_submit_success'
  | 'form_submit_error'

type Props = Record<string, string | number | boolean>

declare global {
  interface Window {
    va?: (event: 'event' | 'beforeSend' | 'pageview', payload?: unknown) => void
    plausible?: (event: string, options?: { props?: Props }) => void
  }
}

export function track(event: ConversionEvent, props: Props = {}) {
  if (typeof window === 'undefined') return
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER
  try {
    if (provider === 'vercel') window.va?.('event', { name: event, data: props })
    else if (provider === 'plausible') window.plausible?.(event, { props })
    if (process.env.NODE_ENV !== 'production') console.info('[analytics]', event, props)
  } catch {
    // La mesure ne doit jamais casser la navigation.
  }
}
