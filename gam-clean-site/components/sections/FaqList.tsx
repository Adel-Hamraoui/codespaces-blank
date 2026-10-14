import { Plus } from 'lucide-react'
import type { FaqItem } from '@/content/faq'
import styles from './FaqList.module.css'

/**
 * Questions fréquentes en accordéon natif (<details>/<summary>) :
 * accessible au clavier et aux lecteurs d'écran, sans JavaScript.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <details key={item.question} className={styles.item}>
          <summary className={styles.summary}>
            <span className={styles.question}>{item.question}</span>
            <Plus size={20} aria-hidden="true" className={styles.icon} />
          </summary>
          <div className={styles.answer}>
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  )
}
