import Link from 'next/link'
import { ExternalLink, Plus } from 'lucide-react'
import { Badge, Flash, PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'
import { ServiceIcon } from '@/frontend/components/ui/ServiceIcon'
import type { IconName } from '@/shared/constants'

export type AdminServiceItem = {
  id: number
  slug: string
  name: string
  icon: IconName
  position: number
  featured: boolean
  published: boolean
  faqCount: number
  leadCount: number
}

export function ServicesAdminView({ services, deleted }: { services: AdminServiceItem[]; deleted: boolean }) {
  return (
    <>
      <PageHeader
        back={{ href: '/admin/contenu', label: 'Contenu du site' }}
        title="Prestations"
        description="Ordre d’affichage croissant. Une prestation déjà demandée par un client ne peut pas être supprimée : dépubliez-la."
        actions={
          <Link href="/admin/contenu/prestations/nouvelle" className={styles.btn}>
            <Plus size={16} aria-hidden="true" /> Nouvelle prestation
          </Link>
        }
      />
      {deleted && <Flash tone="ok">Prestation supprimée.</Flash>}
      <Panel>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Ordre</th>
                <th scope="col">Prestation</th>
                <th scope="col">État</th>
                <th scope="col">FAQ</th>
                <th scope="col">Demandes</th>
                <th scope="col">
                  <span className="sr-only">Voir sur le site</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td data-label="Ordre">{s.position}</td>
                  <td data-label="Prestation">
                    <Link href={`/admin/contenu/prestations/${s.id}`} className={styles.rowLink}>
                      <ServiceIcon name={s.icon} size={16} /> {s.name}
                    </Link>
                    <span className={styles.sub}>/prestations/{s.slug}</span>
                  </td>
                  <td data-label="État">
                    {s.published ? <Badge tone="success">Publiée</Badge> : <Badge tone="neutral">Brouillon</Badge>}{' '}
                    {s.featured && <Badge tone="info">Principale</Badge>}
                  </td>
                  <td data-label="FAQ">{s.faqCount}</td>
                  <td data-label="Demandes">{s.leadCount}</td>
                  <td data-label="">
                    {s.published && (
                      <a href={`/prestations/${s.slug}`} target="_blank" rel="noopener" className={styles.sub}>
                        Voir <ExternalLink size={12} aria-hidden="true" />
                        <span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
