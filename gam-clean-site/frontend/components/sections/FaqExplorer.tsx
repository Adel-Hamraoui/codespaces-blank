'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import { Search } from 'lucide-react'
import { FaqList, type FaqEntry } from './FaqList'
import styles from './FaqList.module.css'

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * FAQ avec recherche instantanée. Le champ est présent dès l'affichage (aucun
 * décalage de mise en page) ; sans JavaScript, il est masqué et toutes les
 * questions restent visibles.
 */
export function FaqExplorer({ items }: { items: FaqEntry[] }) {
  const id = useId()
  const [query, setQuery] = useState('')

  const q = normalize(query.trim())
  const shown = q ? items.filter((i) => normalize(`${i.question} ${i.answer}`).includes(q)) : items

  return (
    <>
      <noscript>
        <style>{`.${styles.search}{display:none}`}</style>
      </noscript>
      <div className={styles.search}>
        <label htmlFor={id} className={styles.searchLabel}>
          Rechercher une question
        </label>
        <div className={styles.searchField}>
          <Search size={20} aria-hidden="true" />
          <input
            id={id}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Exemple : devis, horaires, vitres…"
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
        <p className={styles.searchStatus} role="status" aria-live="polite">
          {q ? (shown.length === 0 ? 'Aucune question ne correspond.' : `${shown.length} question${shown.length > 1 ? 's' : ''} sur ${items.length}`) : ''}
        </p>
      </div>
      {shown.length > 0 ? (
        <FaqList items={shown} openAll={q.length > 0} />
      ) : (
        <p className={styles.empty}>
          Votre question n’y figure pas ? <Link href="/contact">Posez-la-nous directement</Link>.
        </p>
      )}
    </>
  )
}
