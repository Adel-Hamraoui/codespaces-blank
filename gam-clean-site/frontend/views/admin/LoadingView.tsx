'use client'
// ============================================================================
// Chargement d'une page du back-office (app/admin/(espace)/loading.tsx) :
// affiché dès le clic, pendant que le serveur répond. Après un délai anormal,
// un message propose de recharger au lieu d'un indicateur sans fin.
// ============================================================================
import { LoaderCircle } from 'lucide-react'
import { StallNotice } from '@/frontend/components/admin/forms'
import { adminStyles as styles } from '@/frontend/components/admin/ui'
import { usePendingTooLong } from '@/frontend/lib/use-form-action'

export function LoadingView() {
  const stalled = usePendingTooLong(true)
  return (
    <div className={styles.loading}>
      <p className={styles.loadingLabel} role="status">
        <LoaderCircle size={20} aria-hidden="true" className="spin" />
        Chargement de la page…
      </p>
      {stalled && <StallNotice navigation />}
    </div>
  )
}
