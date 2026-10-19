import { TO_CONFIRM } from '@/frontend/lib/format'

/** Marque visiblement une information obligatoire encore manquante (pages légales). */
export function ToConfirm({ label }: { label?: string }) {
  return (
    <span className="to-confirm">
      {TO_CONFIRM}
      {label ? ` : ${label}` : ''}
    </span>
  )
}
