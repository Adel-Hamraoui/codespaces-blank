import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { JsonLd } from '@/frontend/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/frontend/lib/seo'
import styles from './Breadcrumbs.module.css'

export type Crumb = { name: string; path: string }

/** Fil d'Ariane visible + données structurées BreadcrumbList. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: 'Accueil', path: '/' }, ...items]
  return (
    <>
      <nav aria-label="Fil d’Ariane" className={styles.nav}>
        <ol className={styles.list}>
          {all.map((item, i) => {
            const last = i === all.length - 1
            return (
              <li key={item.path}>
                {last ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <>
                    <Link href={item.path}>{item.name}</Link>
                    <ChevronRight size={14} aria-hidden="true" />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  )
}
