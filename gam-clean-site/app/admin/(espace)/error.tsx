'use client'
// Erreur pendant l'affichage d'une page du back-office (par exemple une requête
// expirée, voir backend/db/client.ts) : le menu reste en place.
import { ErrorView } from '@/frontend/views/admin/ErrorView'

export default function EspaceError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorView digest={error.digest} retry={retry} />
}
