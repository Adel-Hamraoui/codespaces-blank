import { Star } from 'lucide-react'
import styles from './Stars.module.css'

/** Note sur 5 : étoiles décoratives + texte équivalent pour les lecteurs d'écran. */
export function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <span className={styles.stars} role="img" aria-label={`Note : ${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} aria-hidden="true" className={n <= rating ? styles.on : styles.off} />
      ))}
    </span>
  )
}
