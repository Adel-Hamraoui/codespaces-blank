import Link from 'next/link'
import { EmptyState } from '@/frontend/components/admin/ui'

export default function AdminNotFound() {
  return (
    <EmptyState title="Élément introuvable">
      Il a peut-être été supprimé. <Link href="/admin">Retour au tableau de bord</Link>
    </EmptyState>
  )
}
