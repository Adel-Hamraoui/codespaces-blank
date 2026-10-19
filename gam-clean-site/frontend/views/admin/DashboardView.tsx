import Link from 'next/link'
import { ArrowRight, CircleAlert } from 'lucide-react'
import { EmptyState, Flash, PageHeader, Panel, Stat, adminStyles as styles } from '@/frontend/components/admin/ui'
import { LEAD_STATUSES } from '@/shared/constants'
import { can } from '@/shared/auth/permissions'
import type { AdminUser, DashboardStats, LeadListItem } from '@/shared/types/admin'
import type { Claim, SiteSettings } from '@/shared/types/content'
import { LeadsTable } from './shared'

type Props = {
  user: AdminUser
  stats: DashboardStats
  recent: LeadListItem[]
  settings: SiteSettings | null
  claims: Claim[]
  now: number
  notice: 'acces-refuse' | 'bienvenue' | null
}

const STATUS_COLORS: Record<string, string> = {
  new: '#1d5fd1',
  in_progress: '#d97706',
  quote_sent: '#7c3aed',
  won: '#0b7a4b',
  lost: '#94a3b8',
  spam: '#b42318',
}

/** Informations obligatoires ou utiles encore absentes (remplace l'ancien script check:content). */
function missingInfo(s: SiteSettings | null, claims: Claim[]): string[] {
  if (!s) return ['Coordonnées de l’entreprise non enregistrées en base (lancez npm run db:seed).']
  const out: string[] = []
  if (!s.legalForm) out.push('Forme juridique (mentions légales)')
  if (!s.shareCapital) out.push('Capital social (mentions légales)')
  if (!s.registration) out.push('Immatriculation RCS / RNE (mentions légales)')
  if (!s.publicationDirector) out.push('Directeur de la publication (mentions légales)')
  if (!s.address.street) out.push('Adresse du siège (mentions légales)')
  if (!s.host.address) out.push('Adresse de l’hébergeur (mentions légales)')
  if (!s.apeCode) out.push('Code APE')
  if (!s.responseTime) out.push('Délai de réponse aux demandes')
  if (!s.openingHours) out.push('Horaires de joignabilité')
  if (s.linkedin.url && !s.linkedin.confirmed) out.push('Lien LinkedIn à vérifier avant publication')
  const unconfirmed = claims.filter((c) => !c.confirmed).length
  if (unconfirmed > 0) out.push(`${unconfirmed} affirmation(s) commerciale(s) non confirmée(s), donc masquée(s)`)
  return out
}

export function DashboardView({ user, stats, recent, settings, claims, now, notice }: Props) {
  const inProgress = stats.byStatus.in_progress + stats.byStatus.quote_sent
  const total = Object.values(stats.byStatus).reduce((a, b) => a + b, 0)
  const trend =
    stats.previous30Days > 0 ? Math.round(((stats.last30Days - stats.previous30Days) / stats.previous30Days) * 100) : null
  const conversion = stats.closed90Days > 0 ? Math.round((stats.won90Days / stats.closed90Days) * 100) : null
  const todo = can(user, 'editContent') ? missingInfo(settings, claims) : []

  return (
    <>
      <PageHeader title={`Bonjour ${user.displayName}`} description="Vue d’ensemble de l’activité du site." />
      {notice === 'acces-refuse' && <Flash tone="error">Votre rôle ne donne pas accès à cette page.</Flash>}
      {notice === 'bienvenue' && <Flash tone="ok">Mot de passe enregistré : bienvenue dans le back-office.</Flash>}
      {stats.unnotified > 0 && (
        <Flash tone="error">
          {stats.unnotified} demande(s) enregistrée(s) sans e-mail de notification : vérifiez la configuration de l’envoi
          (RESEND_API_KEY, CONTACT_TO_EMAIL). Un nouvel essai a lieu chaque nuit.
        </Flash>
      )}

      <div className={styles.stats}>
        <Stat label="Nouvelles demandes" value={stats.byStatus.new} note="à traiter" href="/admin/demandes?statut=new" />
        <Stat
          label="En cours"
          value={inProgress}
          note={`dont ${stats.byStatus.quote_sent} devis envoyé(s)`}
          href="/admin/demandes?statut=in_progress"
        />
        <Stat
          label="Reçues sur 30 jours"
          value={stats.last30Days}
          note={
            trend === null ? (
              'pas de comparaison possible'
            ) : (
              <>
                <span className={trend >= 0 ? styles.up : styles.down}>
                  {trend >= 0 ? '+' : ''}
                  {trend} %
                </span>{' '}
                par rapport aux 30 jours précédents
              </>
            )
          }
        />
        <Stat
          label="Taux de transformation"
          value={conversion === null ? '—' : `${conversion} %`}
          note={conversion === null ? 'aucune demande clôturée sur 90 jours' : `${stats.won90Days} gagnée(s) sur ${stats.closed90Days} clôturée(s), 90 jours`}
        />
        {can(user, 'moderateReviews') && (
          <Stat label="Avis à modérer" value={stats.pendingReviews} note={`${stats.publishedReviews} publié(s)`} href="/admin/avis" />
        )}
      </div>

      <div className={styles.grid2}>
        <Panel
          title="Dernières demandes"
          actions={
            <Link href="/admin/demandes" className="link-arrow">
              Toutes les demandes <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        >
          {recent.length > 0 ? (
            <LeadsTable items={recent} now={now} compact />
          ) : (
            <EmptyState title="Aucune demande pour le moment">Les demandes envoyées depuis le site apparaîtront ici.</EmptyState>
          )}
        </Panel>

        <div className={styles.stack}>
          <Panel title="Répartition des demandes" description={`${total} au total`}>
            <div className={styles.pipeline} aria-hidden="true">
              {LEAD_STATUSES.map((s) =>
                stats.byStatus[s.value] > 0 ? (
                  <span
                    key={s.value}
                    style={{ width: `${(stats.byStatus[s.value] / Math.max(total, 1)) * 100}%`, background: STATUS_COLORS[s.value] }}
                  />
                ) : null
              )}
            </div>
            <ul className={styles.legend}>
              {LEAD_STATUSES.map((s) => (
                <li key={s.value}>
                  <span className={styles.dot} style={{ background: STATUS_COLORS[s.value] }} aria-hidden="true" />
                  <Link href={`/admin/demandes?statut=${s.value}`}>
                    {s.label} : {stats.byStatus[s.value]}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          {todo.length > 0 && (
            <Panel
              title="Informations à compléter"
              description="Elles ne sont pas inventées : tant qu’elles manquent, le site les masque ou les signale."
              actions={
                <Link href="/admin/contenu/coordonnees" className="link-arrow">
                  Compléter <ArrowRight size={16} aria-hidden="true" />
                </Link>
              }
            >
              <ul className={styles.todo}>
                {todo.map((t) => (
                  <li key={t}>
                    <CircleAlert size={16} aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}
