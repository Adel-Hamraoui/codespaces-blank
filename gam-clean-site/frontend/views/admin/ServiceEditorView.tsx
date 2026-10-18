'use client'

import { Trash2 } from 'lucide-react'
import {
  ActionForm,
  Checkbox,
  SelectField,
  SubmitButton,
  TextArea,
  TextField,
  type FormAction,
} from '@/frontend/components/admin/forms'
import { Flash, PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'
import { ICON_LABELS, IMAGE_KEYS, SERVICE_ICONS } from '@/shared/constants'
import type { ServiceInput } from '@/shared/validation/content'
import { formatGroups, formatSteps } from '@/shared/validation/content'

type Props = {
  service: (ServiceInput & { id: number }) | null
  others: { id: number; name: string }[]
  created: boolean
  save: FormAction
  remove: FormAction
}

const ICONS = SERVICE_ICONS.map((i) => ({ value: i, label: ICON_LABELS[i] }))
const IMAGES = IMAGE_KEYS.map((k) => ({ value: k, label: k }))

export function ServiceEditorView({ service: s, others, created, save, remove }: Props) {
  return (
    <>
      <PageHeader
        back={{ href: '/admin/contenu/prestations', label: 'Prestations' }}
        title={s ? s.name : 'Nouvelle prestation'}
        description={s ? `Page publique : /prestations/${s.slug}` : 'Elle apparaîtra sur le site une fois publiée.'}
      />
      {created && <Flash tone="ok">Prestation créée.</Flash>}
      <Panel>
        <ActionForm
          action={save}
          render={(state) => {
            const e = state.fieldErrors ?? {}
            return (
              <>
                {s && <input type="hidden" name="id" value={s.id} />}
                <fieldset className={styles.fieldset}>
                  <legend>Présentation</legend>
                  <div className={styles.formRow}>
                    <TextField label="Nom (menus, cartes)" name="name" defaultValue={s?.name} required max={60} error={e.name} />
                    <TextField
                      label="Adresse de la page"
                      name="slug"
                      defaultValue={s?.slug}
                      error={e.slug}
                      hint="Lettres minuscules et tirets. Laissez vide pour la créer depuis le nom. La modifier casse les liens existants."
                    />
                  </div>
                  <TextArea label="Résumé (une phrase)" name="summary" rows={2} defaultValue={s?.summary} required max={220} error={e.summary} />
                  <div className={styles.formRow}>
                    <SelectField label="Icône" name="icon" options={ICONS} defaultValue={s?.icon ?? 'building'} />
                    <TextField label="Ordre d’affichage" name="position" type="number" defaultValue={s?.position ?? 0} error={e.position} />
                  </div>
                  <div className={styles.checks}>
                    <Checkbox name="published" defaultChecked={s?.published ?? false} label="Publiée sur le site" />
                    <Checkbox name="featured" defaultChecked={s?.featured ?? false} label="Prestation principale" description="Carte avec photo." />
                  </div>
                </fieldset>

                <fieldset className={styles.fieldset}>
                  <legend>Contenu de la page</legend>
                  <TextField label="Titre de la page (H1)" name="h1" defaultValue={s?.h1} required max={110} error={e.h1} />
                  <TextArea label="Introduction" name="intro" rows={4} defaultValue={s?.intro.join('\n')} error={e.intro} hint="Un paragraphe par ligne." />
                  <TextArea label="Ce qui est pris en charge" name="includes" rows={6} defaultValue={s?.includes.join('\n')} hint="Un point par ligne." />
                  <TextArea label="Pour quels locaux ?" name="forWhom" rows={3} defaultValue={s?.forWhom.join('\n')} hint="Une étiquette par ligne." />
                  <TextArea
                    label="Organisation de l’intervention"
                    name="howItWorks"
                    rows={4}
                    code
                    defaultValue={s ? formatSteps(s.howItWorks) : ''}
                    hint="Une étape par ligne : « Titre :: texte » (6 étapes au maximum)."
                  />
                  <TextArea
                    label="Groupes de spécialités (facultatif)"
                    name="groups"
                    rows={6}
                    code
                    defaultValue={s ? formatGroups(s.groups) : ''}
                    hint={`Remplace la liste « Ce qui est pris en charge ». Format : « ## Titre | icône » puis « - point » par ligne. Icônes : ${SERVICE_ICONS.join(', ')}.`}
                  />
                  {others.length > 0 && (
                    <fieldset className={styles.fieldset}>
                      <legend>Prestations complémentaires (6 au maximum)</legend>
                      <div className={styles.checks}>
                        {others.map((o) => (
                          <Checkbox
                            key={o.id}
                            name="relatedIds"
                            value={String(o.id)}
                            label={o.name}
                            defaultChecked={s?.relatedIds.includes(o.id)}
                          />
                        ))}
                      </div>
                    </fieldset>
                  )}
                </fieldset>

                <fieldset className={styles.fieldset}>
                  <legend>Photo</legend>
                  <div className={styles.formRow}>
                    <SelectField label="Photo" name="imageKey" options={IMAGES} emptyLabel="Aucune (emplacement réservé)" defaultValue={s?.imageKey} />
                    <TextField label="Description de la photo" name="imageAlt" defaultValue={s?.imageAlt} error={e.imageAlt} max={200} hint="Texte lu par les lecteurs d’écran." />
                  </div>
                  <TextArea
                    label="Photo réelle à prévoir"
                    name="photoBrief"
                    rows={2}
                    defaultValue={s?.photoBrief}
                    max={300}
                    hint="Visible en développement seulement, à la place d’une photo manquante."
                  />
                </fieldset>

                <fieldset className={styles.fieldset}>
                  <legend>Référencement (Google)</legend>
                  <TextField label="Titre Google" name="metaTitle" defaultValue={s?.metaTitle} required max={70} error={e.metaTitle} hint="Entre 10 et 70 caractères, le nom du site est ajouté automatiquement." />
                  <TextArea label="Description Google" name="metaDescription" rows={2} defaultValue={s?.metaDescription} required max={170} error={e.metaDescription} hint="Entre 50 et 170 caractères." />
                </fieldset>

                <div className={`${styles.actions} ${styles.stickyActions}`}>
                  <SubmitButton>{s ? 'Enregistrer et publier' : 'Créer la prestation'}</SubmitButton>
                </div>
              </>
            )
          }}
        />
      </Panel>

      {s && (
        <Panel title="Supprimer la prestation" description="Impossible si des demandes la mentionnent : dépubliez-la plutôt.">
          <ActionForm action={remove}>
            <input type="hidden" name="id" value={s.id} />
            <SubmitButton variant="danger" confirm={`Supprimer définitivement « ${s.name} », sa FAQ et ses liens ?`}>
              <Trash2 size={16} aria-hidden="true" /> Supprimer
            </SubmitButton>
          </ActionForm>
        </Panel>
      )}
    </>
  )
}
