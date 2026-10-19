'use client'
// Erreur pendant l'affichage d'une page ou d'une action du back-office
// (y compris une requête expirée : voir backend/db/client.ts).
import { ErrorView } from '@/frontend/views/admin/ErrorView'

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorView digest={error.digest} retry={retry} standalone />
}
