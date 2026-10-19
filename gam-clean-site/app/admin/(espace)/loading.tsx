// Affiché immédiatement lors d'un changement de page dans le back-office,
// pendant que le serveur répond (le menu reste en place).
import { LoadingView } from '@/frontend/views/admin/LoadingView'

export default function Loading() {
  return <LoadingView />
}
