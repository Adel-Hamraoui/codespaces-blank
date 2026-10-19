import Link from 'next/link'
import { CircleAlert } from 'lucide-react'
import { ReviewForm } from '@/frontend/components/forms/ReviewForm'
import type { ActionState } from '@/shared/types/admin'
import type { ServiceSummary, SiteSettings } from '@/shared/types/content'
import styles from './ReviewView.module.css'

type Props = {
  settings: SiteSettings
  services: Pick<ServiceSummary, 'slug' | 'name'>[]
  /** Invitation valide, ou null si le lien est expiré, déjà utilisé ou inconnu. */
  invitation: { clientName: string; serviceSlugs: string[] } | null
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
}

/** Formulaire d'avis accessible uniquement par un lien personnel à usage unique. */
export function ReviewView({ settings, services, invitation, action }: Props) {
  if (!invitation) {
    return (
      <div className={styles.card}>
        <span className={styles.warn}>
          <CircleAlert size={36} aria-hidden="true" />
        </span>
        <h2>Ce lien n’est plus valide</h2>
        <p>
          Il a peut-être déjà été utilisé, ou sa durée de validité est dépassée. Pour toute question, contactez{' '}
          {settings.companyName} au <a href={settings.phone.href}>{settings.phone.display}</a>.
        </p>
        <p>
          <Link href="/">Retour à l’accueil</Link>
        </p>
      </div>
    )
  }
  const defaultService = invitation.serviceSlugs.find((s) => services.some((v) => v.slug === s)) ?? null
  return (
    <div className={styles.card}>
      <p className={styles.intro}>
        Bonjour {invitation.clientName}, merci de prendre une minute pour évaluer l’intervention de{' '}
        {settings.companyName}. Votre retour nous aide à progresser.
      </p>
      <ReviewForm
        action={action}
        clientName={invitation.clientName}
        services={services}
        defaultService={defaultService}
        brandName={settings.companyName}
      />
    </div>
  )
}

export function ReviewSkeleton() {
  return <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true" />
}
