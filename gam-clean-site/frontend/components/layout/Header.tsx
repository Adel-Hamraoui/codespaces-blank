'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Menu, Phone, X } from 'lucide-react'
import logo from '@/frontend/assets/brand/logo-light.png'
import { mainNav } from '@/frontend/config/navigation'
import { ServiceIcon } from '@/frontend/components/ui/ServiceIcon'
import type { ServiceSummary } from '@/shared/types/content'
import styles from './Header.module.css'

type Props = {
  brandName: string
  phone: { href: string; display: string }
  services: Pick<ServiceSummary, 'slug' | 'name' | 'summary' | 'icon'>[]
}

/** En-tête complet : l'adresse courante sert à signaler la rubrique active. */
export function Header(props: Props) {
  return <HeaderView {...props} pathname={usePathname()} />
}

/**
 * Rendu de l'en-tête. `pathname` vaut null pendant le prérendu d'une adresse
 * encore inconnue (repli de <Suspense>) : aucune rubrique n'est alors active.
 */
export function HeaderView({ brandName, phone, services, pathname }: Props & { pathname: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesRef = useRef<HTMLLIElement>(null)
  const servicesButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const servicesMenuId = useId()
  const mobilePanelId = useId()

  const isActive = (href: string) => pathname !== null && (pathname === href || pathname.startsWith(`${href}/`))

  // Ferme les menus à chaque changement de page.
  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
  }, [pathname])

  // Menu « Prestations » (desktop) : fermeture au clic extérieur et à Échap.
  useEffect(() => {
    if (!servicesOpen) return
    const onPointer = (e: PointerEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesOpen(false)
        servicesButtonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [servicesOpen])

  const closeMobile = useCallback((returnFocus = true) => {
    setMobileOpen(false)
    if (returnFocus) toggleRef.current?.focus()
  }, [])

  // Menu mobile : verrouillage du défilement, focus initial, Échap, piège de focus.
  useEffect(() => {
    if (!mobileOpen) return
    const panel = panelRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel?.querySelector<HTMLElement>('a, button')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMobile()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const focusables = [toggleRef.current, ...panel.querySelectorAll<HTMLElement>('a, button')].filter(
        Boolean
      ) as HTMLElement[]
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen, closeMobile])

  // Passage en desktop : on ferme le menu mobile.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mq.matches && setMobileOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <header className={styles.header} data-menu-open={mobileOpen || undefined}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label={`${brandName}, retour à l’accueil`}>
          <Image src={logo} alt="" className={styles.logo} loading="eager" sizes="200px" />
        </Link>

        {/* ---------- Navigation desktop ---------- */}
        <nav className={styles.desktopNav} aria-label="Navigation principale">
          <ul className={styles.navList}>
            <li ref={servicesRef} className={styles.hasMenu}>
              <button
                ref={servicesButtonRef}
                type="button"
                className={`${styles.navLink} ${isActive('/prestations') ? styles.active : ''}`}
                aria-expanded={servicesOpen}
                aria-controls={servicesMenuId}
                onClick={() => setServicesOpen((v) => !v)}
              >
                Prestations
                <ChevronDown size={16} aria-hidden="true" className={styles.chevron} />
              </button>
              <div id={servicesMenuId} className={styles.megaMenu} hidden={!servicesOpen}>
                <ul className={styles.megaGrid}>
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/prestations/${s.slug}`} className={styles.megaItem}>
                        <span className={styles.megaIcon}>
                          <ServiceIcon name={s.icon} size={20} />
                        </span>
                        <span>
                          <span className={styles.megaTitle}>{s.name}</span>
                          <span className={styles.megaText}>{s.summary}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/prestations" className={`link-arrow ${styles.megaAll}`}>
                  Voir toutes les prestations <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </li>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a href={phone.href} className={styles.phone} data-track-location="header">
            <Phone size={18} aria-hidden="true" />
            <span className={styles.phoneText}>{phone.display}</span>
            <span className="sr-only">Appeler {brandName}</span>
          </a>
          <Link
            href="/devis"
            className={`btn ${styles.cta}`}
            data-track="cta_devis_click"
            data-track-location="header"
          >
            Demander un devis
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={mobileOpen}
            aria-controls={mobilePanelId}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => (mobileOpen ? closeMobile(false) : setMobileOpen(true))}
          >
            {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* ---------- Menu mobile ---------- */}
      <div id={mobilePanelId} ref={panelRef} className={styles.mobilePanel} hidden={!mobileOpen}>
        <nav aria-label="Navigation mobile" className="container">
          <p className={styles.mobileHeading}>Prestations</p>
          <ul className={styles.mobileServices}>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/prestations/${s.slug}`} className={styles.mobileServiceLink}>
                  <ServiceIcon name={s.icon} size={20} />
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
          <ul className={styles.mobileMain}>
            <li>
              <Link href="/prestations" className={styles.mobileLink}>
                Toutes les prestations
              </Link>
            </li>
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.mobileLink}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.mobileCtas}>
            <Link
              href="/devis"
              className="btn btn-lg btn-block"
              data-track="cta_devis_click"
              data-track-location="menu-mobile"
            >
              Demander un devis
            </Link>
            <a
              href={phone.href}
              className="btn btn-secondary btn-lg btn-block"
              data-track-location="menu-mobile"
            >
              <Phone size={18} aria-hidden="true" /> {phone.display}
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
