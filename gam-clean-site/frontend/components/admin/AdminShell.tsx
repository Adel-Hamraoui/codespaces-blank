'use client'
// ============================================================================
// Coque du back-office : navigation latérale (tiroir sur mobile), compte connecté.
// ============================================================================
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import {
  ExternalLink,
  FileText,
  History,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Star,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import logo from '@/frontend/assets/brand/logo-dark.png'
import { usePendingTooLong } from '@/frontend/lib/use-form-action'
import { can } from '@/shared/auth/permissions'
import { ADMIN_ROLES, labelOf } from '@/shared/constants'
import type { AdminUser } from '@/shared/types/admin'
import { DevNavigationNotice } from './DevNavigationNotice'
import styles from './admin.module.css'

/** Déconnexion : indicateur pendant l'envoi, message si la réponse tarde anormalement. */
function LogoutButton() {
  const { pending } = useFormStatus()
  const stalled = usePendingTooLong(pending)
  return (
    <>
      <button type="submit" className={styles.footLink} disabled={pending}>
        {pending ? <LoaderCircle size={16} aria-hidden="true" className="spin" /> : <LogOut size={16} aria-hidden="true" />}
        Se déconnecter
      </button>
      {stalled && (
        <p className={styles.footNotice} role="alert">
          La déconnexion tarde.{' '}
          <button type="button" onClick={() => window.location.reload()}>
            Recharger la page
          </button>
        </p>
      )}
    </>
  )
}

type Props = {
  brandName: string
  user: AdminUser
  counts: { newLeads: number; pendingReviews: number }
  logoutAction: () => Promise<void>
  children: ReactNode
}

export function AdminShell({ brandName, user, counts, logoutAction, children }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  // Sur mobile, le tiroir fermé est retiré de l'ordre de tabulation (attribut inert).
  const [desktop, setDesktop] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const items = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true, show: true },
    { href: '/admin/demandes', label: 'Demandes', icon: Inbox, badge: counts.newLeads, show: true },
    { href: '/admin/avis', label: 'Avis clients', icon: Star, badge: counts.pendingReviews, show: can(user, 'moderateReviews') },
    { href: '/admin/contenu', label: 'Contenu du site', icon: FileText, show: can(user, 'editContent') },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, show: can(user, 'manageUsers') },
    { href: '/admin/journal', label: 'Journal', icon: History, show: can(user, 'viewAudit') },
  ].filter((i) => i.show)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className={styles.shell}>
      <a href="#contenu-admin" className="skip-link">
        Aller au contenu
      </a>

      <div className={styles.topbar}>
        <Link href="/admin" aria-label="Tableau de bord">
          <Image src={logo} alt="" sizes="96px" />
        </Link>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="admin-navigation"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {open && <button type="button" className={styles.backdrop} aria-label="Fermer le menu" onClick={() => setOpen(false)} />}

      <aside id="admin-navigation" className={styles.sidebar} data-open={open} inert={!desktop && !open}>
        <Link href="/admin" className={styles.brand}>
          <Image src={logo} alt={brandName} sizes="112px" />
          <span className={styles.brandTag}>Back-office</span>
        </Link>

        <nav aria-label="Navigation du back-office">
          <ul className={styles.nav}>
            {items.map(({ href, label, icon: Icon, badge, exact }) => (
              <li key={href}>
                <Link href={href} className={styles.navLink} aria-current={isActive(href, exact) ? 'page' : undefined}>
                  <Icon size={18} aria-hidden="true" />
                  {label}
                  {badge ? (
                    <span className={styles.navBadge}>
                      {badge}
                      <span className="sr-only"> en attente</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFoot}>
          <p className={styles.who}>
            <strong>{user.displayName}</strong>
            {labelOf(ADMIN_ROLES, user.role)}
          </p>
          <Link href="/admin/compte" className={styles.footLink} aria-current={pathname === '/admin/compte' ? 'page' : undefined}>
            <UserRound size={16} aria-hidden="true" /> Mon compte
          </Link>
          <a href="/" className={styles.footLink} target="_blank" rel="noopener">
            <ExternalLink size={16} aria-hidden="true" /> Voir le site
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          <form action={logoutAction}>
            <LogoutButton />
          </form>
        </div>
      </aside>

      <main id="contenu-admin" className={styles.main} tabIndex={-1}>
        <div className={styles.content}>
          {process.env.NODE_ENV !== 'production' && <DevNavigationNotice />}
          {children}
        </div>
      </main>
    </div>
  )
}
