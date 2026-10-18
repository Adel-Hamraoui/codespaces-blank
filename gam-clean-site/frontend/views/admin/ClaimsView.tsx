'use client'

import { ActionForm, Checkbox, SubmitButton, TextArea, TextField, type FormAction } from '@/frontend/components/admin/forms'
import { Badge, Flash, PageHeader, adminStyles as styles } from '@/frontend/components/admin/ui'
import type { Claim } from '@/shared/types/content'

export function ClaimsView({ claims, action }: { claims: Claim[]; action: FormAction }) {
  return (
    <>
      <PageHeader
        back={{ href: '/admin/contenu', label: 'Contenu du site' }}
        title="Affirmations commerciales"
        description="Disponibilité, qualifications, assurance… Ne cochez « confirmée » que si vous pouvez la prouver (attestation, certificat)."
      />
      <Flash tone="info">
        Une affirmation confirmée apparaît automatiquement sur le site (arguments, page « L’entreprise »). Non confirmée,
        elle reste invisible.
      </Flash>
      {claims.map((c) => (
        <details key={c.key} className={styles.editItem}>
          <summary>
            <span className={styles.grow}>{c.title}</span>
            {c.confirmed ? <Badge tone="success">Publiée</Badge> : <Badge tone="neutral">Masquée</Badge>}
          </summary>
          <div className={styles.editBody}>
            <ActionForm
              action={action}
              render={(state) => (
                <>
                  <input type="hidden" name="key" value={c.key} />
                  <TextField label="Titre" name="title" defaultValue={c.title} max={80} error={state.fieldErrors?.title} />
                  <TextArea label="Texte" name="body" rows={2} defaultValue={c.body} max={300} error={state.fieldErrors?.body} />
                  <Checkbox
                    name="confirmed"
                    defaultChecked={c.confirmed}
                    label="Affirmation confirmée"
                    description="L’entreprise dispose d’une preuve et accepte de la publier."
                  />
                  <div className={styles.actions}>
                    <SubmitButton>Enregistrer</SubmitButton>
                  </div>
                </>
              )}
            />
          </div>
        </details>
      ))}
    </>
  )
}
