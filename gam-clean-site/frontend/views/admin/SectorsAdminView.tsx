'use client'

import { Plus, Trash2 } from 'lucide-react'
import { ActionForm, Checkbox, SelectField, SubmitButton, TextArea, TextField, type FormAction } from '@/frontend/components/admin/forms'
import { Badge, PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'
import { ICON_LABELS, SERVICE_ICONS, type IconName } from '@/shared/constants'

export type AdminSectorItem = {
  id: number
  slug: string
  name: string
  icon: IconName
  challenge: string
  approach: string
  examples: string[]
  position: number
  published: boolean
  serviceIds: number[]
}

type Props = {
  sectors: AdminSectorItem[]
  services: { id: number; name: string }[]
  save: FormAction
  remove: FormAction
}

const ICONS = SERVICE_ICONS.map((i) => ({ value: i, label: ICON_LABELS[i] }))

function SectorFields({ s, services, errors }: { s?: AdminSectorItem; services: Props['services']; errors: Partial<Record<string, string>> }) {
  return (
    <>
      {s && <input type="hidden" name="id" value={s.id} />}
      <div className={styles.formRow}>
        <TextField label="Nom" name="name" defaultValue={s?.name} required max={60} error={errors.name} />
        <TextField label="Identifiant (ancre de page)" name="slug" defaultValue={s?.slug} error={errors.slug} hint="Laissez vide pour le créer depuis le nom." />
        <SelectField label="Icône" name="icon" options={ICONS} defaultValue={s?.icon ?? 'building'} />
        <TextField label="Ordre" name="position" type="number" defaultValue={s?.position ?? 0} error={errors.position} />
      </div>
      <TextArea label="Vos enjeux" name="challenge" rows={3} defaultValue={s?.challenge} required max={400} error={errors.challenge} />
      <TextArea label="Notre réponse" name="approach" rows={3} defaultValue={s?.approach} required max={400} error={errors.approach} />
      <TextArea label="Exemples de locaux" name="examples" rows={3} defaultValue={s?.examples.join('\n')} hint="Un exemple par ligne." />
      <fieldset className={styles.fieldset}>
        <legend>Prestations associées</legend>
        <div className={styles.checks}>
          {services.map((v) => (
            <Checkbox key={v.id} name="serviceIds" value={String(v.id)} label={v.name} defaultChecked={s?.serviceIds.includes(v.id)} />
          ))}
        </div>
      </fieldset>
      <Checkbox name="published" defaultChecked={s?.published ?? true} label="Publié" />
    </>
  )
}

export function SectorsAdminView({ sectors, services, save, remove }: Props) {
  return (
    <>
      <PageHeader back={{ href: '/admin/contenu', label: 'Contenu du site' }} title="Secteurs d’intervention" />
      {sectors.map((s) => (
        <details key={s.id} className={styles.editItem}>
          <summary>
            <span className={styles.grow}>{s.name}</span>
            {!s.published && <Badge tone="neutral">Masqué</Badge>}
          </summary>
          <div className={styles.editBody}>
            <ActionForm action={save} render={(state) => (
              <>
                <SectorFields s={s} services={services} errors={state.fieldErrors ?? {}} />
                <div className={styles.actions}>
                  <SubmitButton>Enregistrer</SubmitButton>
                </div>
              </>
            )} />
            <ActionForm action={remove}>
              <input type="hidden" name="id" value={s.id} />
              <SubmitButton variant="danger" small confirm={`Supprimer le secteur « ${s.name} » ?`}>
                <Trash2 size={14} aria-hidden="true" /> Supprimer
              </SubmitButton>
            </ActionForm>
          </div>
        </details>
      ))}
      <Panel title="Ajouter un secteur">
        <ActionForm action={save} resetOnSuccess render={(state) => (
          <>
            <SectorFields services={services} errors={state.fieldErrors ?? {}} />
            <div className={styles.actions}>
              <SubmitButton>
                <Plus size={16} aria-hidden="true" /> Ajouter
              </SubmitButton>
            </div>
          </>
        )} />
      </Panel>
    </>
  )
}
