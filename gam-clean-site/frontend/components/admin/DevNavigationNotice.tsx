'use client'
// ============================================================================
// Développement uniquement. Le « Navigation Inspector » des Next.js DevTools
// pose le cookie next-instant-navigation-testing : tant qu'il existe, Next.js
// met en pause les navigations et les actions (l'écran reste en chargement).
// Le cookie est lié à « localhost » et non au port : un autre projet Next.js
// ouvert en local peut le laisser derrière lui. Ce bandeau le rend visible.
// ============================================================================
import { useEffect, useState } from 'react'
import { Flash } from './ui'
import styles from './admin.module.css'

const COOKIE = 'next-instant-navigation-testing'

export function DevNavigationNotice() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const check = () => setActive(document.cookie.split(';').some((c) => c.trim().startsWith(`${COOKIE}=`)))
    check()
    // Mise à jour immédiate là où l'API Cookie Store existe, sinon vérification périodique.
    const store = (globalThis as { cookieStore?: EventTarget }).cookieStore
    store?.addEventListener('change', check)
    const id = window.setInterval(check, 3000)
    return () => {
      store?.removeEventListener('change', check)
      window.clearInterval(id)
    }
  }, [])

  if (!active) return null
  return (
    <Flash tone="error">
      Mode développement : le Navigation Inspector de Next.js est actif (cookie {COOKIE}). Les navigations et les actions
      du back-office restent en pause tant qu’il est présent, même s’il vient d’un autre projet ouvert sur localhost.{' '}
      <button
        type="button"
        className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
        onClick={() => {
          document.cookie = `${COOKIE}=; Path=/; Max-Age=0`
          window.location.reload()
        }}
      >
        Désactiver et recharger
      </button>
    </Flash>
  )
}
