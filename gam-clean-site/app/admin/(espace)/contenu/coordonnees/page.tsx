import type { Metadata } from 'next'
import { updateSettingsAction } from '@/backend/actions/content'
import { requireSql } from '@/backend/db/client'
import { requireAdmin } from '@/backend/modules/auth/guard'
import { fetchSettingsRow } from '@/backend/modules/content/repository'
import { EmptyState } from '@/frontend/components/admin/ui'
import { SettingsView } from '@/frontend/views/admin/SettingsView'

export const metadata: Metadata = { title: 'Entreprise et coordonnées' }

export default async function SettingsPage() {
  await requireAdmin('editContent')
  const settings = await fetchSettingsRow(requireSql())
  if (!settings) {
    return <EmptyState title="Aucune coordonnée en base">Initialisez le contenu avec « npm run db:seed ».</EmptyState>
  }
  return <SettingsView settings={settings} action={updateSettingsAction} />
}
