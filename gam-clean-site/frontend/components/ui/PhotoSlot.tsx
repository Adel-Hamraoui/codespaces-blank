import { Camera } from 'lucide-react'
import type { IconName } from '@/shared/constants'
import { ServiceIcon } from './ServiceIcon'
import styles from './PhotoSlot.module.css'

/**
 * Emplacement visuel quand aucune photo réelle n'est encore disponible.
 * [PHOTO GAM CLEAN RECOMMANDÉE ICI] — en développement, la description de la
 * photo idéale s'affiche ; en production, un panneau graphique sobre la remplace.
 */
export function PhotoSlot({ icon, brief, label }: { icon: IconName; brief: string; label: string }) {
  const showBrief = process.env.NODE_ENV !== 'production'
  return (
    <div className={styles.slot} role="img" aria-label={label}>
      <span className={styles.icon}>
        <ServiceIcon name={icon} size={40} />
      </span>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
      {showBrief && (
        <span className={styles.brief} aria-hidden="true">
          <Camera size={16} /> [PHOTO GAM CLEAN RECOMMANDÉE ICI] {brief}
        </span>
      )}
    </div>
  )
}
