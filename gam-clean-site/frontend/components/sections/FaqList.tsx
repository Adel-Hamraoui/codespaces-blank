import { Plus } from 'lucide-react'
import styles from './FaqList.module.css'

export type FaqEntry = { id?: number; question: string; answer: string }

/**
 * Questions fréquentes en accordéon natif (<details>/<summary>) :
 * accessible au clavier et aux lecteurs d'écran, sans JavaScript.
 */
export function FaqList({ items, openAll = false }: { items: FaqEntry[]; openAll?: boolean }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <details key={item.id ?? item.question} className={styles.item} open={openAll || undefined}>
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
