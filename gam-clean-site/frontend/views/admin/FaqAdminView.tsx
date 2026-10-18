'use client'

import { Plus, Trash2 } from 'lucide-react'
import { ActionForm, Checkbox, SelectField, SubmitButton, TextArea, TextField, type FormAction } from '@/frontend/components/admin/forms'
import { Badge, PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'

export type AdminFaqItem = {
  id: number
  question: string
  answer: string
  position: number
  published: boolean
  serviceId: number | null
  serviceName: string | null
}

type Props = {
  items: AdminFaqItem[]
  services: { id: number; name: string }[]
  save: FormAction
  remove: FormAction
}

function FaqFields({ item, services, errors }: { item?: AdminFaqItem; services: Props['services']; errors: Partial<Record<string, string>> }) {
  return (
    <>
      {item && <input type="hidden" name="id" value={item.id} />}
      <TextField label="Question" name="question" defaultValue={item?.question} required max={200} error={errors.question} />
      <TextArea label="Réponse" name="answer" rows={4} defaultValue={item?.answer} required max={1500} error={errors.answer} />
      <div className={styles.formRow}>
        <SelectField
          label="Page"
          name="serviceId"
          emptyLabel="FAQ générale (page FAQ et accueil)"
          options={services.map((s) => ({ value: String(s.id), label: `Prestation : ${s.name}` }))}
          defaultValue={item?.serviceId}
        />
        <TextField label="Ordre" name="position" type="number" defaultValue={item?.position ?? 0} error={errors.position} />
      </div>
      <Checkbox name="published" defaultChecked={item?.published ?? true} label="Publiée" />
    </>
  )
}

export function FaqAdminView({ items, services, save, remove }: Props) {
  const groups = new Map<string, AdminFaqItem[]>()
  for (const i of items) {
    const key = i.serviceName ? `Prestation : ${i.serviceName}` : 'FAQ générale'
    groups.set(key, [...(groups.get(key) ?? []), i])
  }
  return (
    <>
      <PageHeader
        back={{ href: '/admin/contenu', label: 'Contenu du site' }}
        title="Questions fréquentes"
        description="Les 5 premières questions générales apparaissent aussi sur la page d’accueil."
      />
      <Panel title="Ajouter une question">
        <ActionForm action={save} resetOnSuccess render={(state) => (
          <>
            <FaqFields services={services} errors={state.fieldErrors ?? {}} />
            <div className={styles.actions}>
              <SubmitButton>
                <Plus size={16} aria-hidden="true" /> Ajouter
              </SubmitButton>
            </div>
          </>
        )} />
      </Panel>
      {[...groups].map(([title, list]) => (
        <Panel key={title} title={title} description={`${list.length} question(s)`}>
          {list.map((item) => (
            <details key={item.id} className={styles.editItem}>
              <summary>
                <span className={styles.grow}>{item.question}</span>
                {!item.published && <Badge tone="neutral">Masquée</Badge>}
              </summary>
              <div className={styles.editBody}>
                <ActionForm action={save} render={(state) => (
                  <>
                    <FaqFields item={item} services={services} errors={state.fieldErrors ?? {}} />
                    <div className={styles.actions}>
                      <SubmitButton>Enregistrer</SubmitButton>
                    </div>
                  </>
                )} />
                <ActionForm action={remove}>
                  <input type="hidden" name="id" value={item.id} />
                  <SubmitButton variant="danger" small confirm="Supprimer cette question ?">
                    <Trash2 size={14} aria-hidden="true" /> Supprimer
                  </SubmitButton>
                </ActionForm>
              </div>
            </details>
          ))}
        </Panel>
      ))}
    </>
  )
}
