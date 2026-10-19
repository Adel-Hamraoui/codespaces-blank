'use client'
// ============================================================================
// Erreur d'affichage du back-office (app/admin/error.tsx), par exemple une base
// de données qui ne répond pas dans le délai : message clair au lieu d'un
// chargement sans fin. Le détail est dans les journaux du serveur (référence).
// ============================================================================
import { RotateCcw } from 'lucide-react'
import { adminStyles as styles } from '@/frontend/components/admin/ui'

/** `standalone` : hors de la coque du back-office (connexion, erreur du menu lui-même). */
export function ErrorView({ digest, retry, standalone }: { digest?: string; retry: () => void; standalone?: boolean }) {
  const content = (
    <div className={standalone ? styles.loginCard : styles.panel} role="alert">
      <h1>Page indisponible</h1>
      <p>
        Le serveur n’a pas pu afficher cette page : la base de données n’a pas répondu à temps ou une erreur est
        survenue. Réessayez dans un instant.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={retry}>
          <RotateCcw size={16} aria-hidden="true" /> Réessayer
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => window.location.reload()}>
          Recharger la page
        </button>
      </div>
      {digest && <p>Référence à transmettre si le problème persiste : {digest}</p>}
    </div>
  )
  return standalone ? <div className={styles.loginPage}>{content}</div> : content
}
