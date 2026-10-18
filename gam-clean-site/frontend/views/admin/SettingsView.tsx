'use client'

import { ActionForm, Checkbox, SubmitButton, TextArea, TextField, type FormAction } from '@/frontend/components/admin/forms'
import { PageHeader, Panel, adminStyles as styles } from '@/frontend/components/admin/ui'
import type { SiteSettings } from '@/shared/types/content'

type Props = { settings: SiteSettings; action: FormAction }

export function SettingsView({ settings: s, action }: Props) {
  return (
    <>
      <PageHeader
        back={{ href: '/admin/contenu', label: 'Contenu du site' }}
        title="Entreprise et coordonnées"
        description="Laissez vide une information inconnue : elle sera masquée, ou signalée « à confirmer » dans les mentions légales."
      />
      <Panel>
        <ActionForm
          action={action}
          render={(state) => {
            const e = state.fieldErrors ?? {}
            return (
              <>
                <fieldset className={styles.fieldset}>
                  <legend>Identité</legend>
                  <div className={styles.formRow}>
                    <TextField label="Nom commercial" name="companyName" defaultValue={s.companyName} required error={e.companyName} />
                    <TextField label="Raison sociale" name="legalName" defaultValue={s.legalName} required error={e.legalName} />
                    <TextField label="Forme juridique" name="legalForm" defaultValue={s.legalForm} placeholder="SAS, SARL, EI…" />
                  </div>
                  <div className={styles.formRow}>
                    <TextField label="SIRET" name="siret" defaultValue={s.siret} required error={e.siret} inputMode="numeric" />
                    <TextField label="N° de TVA intracommunautaire" name="vatNumber" defaultValue={s.vatNumber} error={e.vatNumber} />
                    <TextField label="Code APE" name="apeCode" defaultValue={s.apeCode} error={e.apeCode} placeholder="81.21Z" />
                  </div>
                  <div className={styles.formRow}>
                    <TextField label="Immatriculation (RCS / RNE)" name="registration" defaultValue={s.registration} />
                    <TextField label="Capital social" name="shareCapital" defaultValue={s.shareCapital} placeholder="1 000 €" />
                    <TextField label="Année de création" name="foundedYear" defaultValue={s.foundedYear} error={e.foundedYear} inputMode="numeric" />
                  </div>
                  <TextField label="Directeur de la publication" name="publicationDirector" defaultValue={s.publicationDirector} />
                </fieldset>

                <fieldset className={styles.fieldset}>
                  <legend>Contact</legend>
                  <div className={styles.formRow}>
                    <TextField label="Téléphone" name="phone" type="tel" defaultValue={s.phone.display} required error={e.phone} />
                    <TextField label="E-mail" name="email" type="email" defaultValue={s.email} required error={e.email} />
                    <TextField
                      label="Délai de réponse"
                      name="responseTime"
                      defaultValue={s.responseTime}
                      placeholder="sous 24 heures ouvrées"
                      hint="Affiché après l’envoi d’une demande. Uniquement si l’engagement est tenu."
                    />
                  </div>
                  <TextArea
                    label="Horaires de joignabilité"
                    name="openingHours"
                    rows={3}
                    defaultValue={(s.openingHours ?? []).map((h) => `${h.days} : ${h.hours}`).join('\n')}
                    hint="Une ligne par plage, au format « Jours : horaires » (ex. Du lundi au vendredi : 8 h – 18 h)."
                  />
                  <div className={styles.formRow}>
                    <TextField label="Page LinkedIn" name="linkedinUrl" type="url" defaultValue={s.linkedin.url} error={e.linkedinUrl} />
                  </div>
                  <Checkbox
                    name="linkedinConfirmed"
                    defaultChecked={s.linkedin.confirmed}
                    label="Lien LinkedIn vérifié"
                    description="Publié dans les données structurées uniquement s’il est coché."
                  />
                </fieldset>

                <fieldset className={styles.fieldset}>
                  <legend>Adresse et zone d’intervention</legend>
                  <TextField label="Adresse du siège" name="street" defaultValue={s.address.street} hint="Laissez vide pour ne pas la publier." />
                  <div className={styles.formRow}>
                    <TextField label="Code postal" name="postalCode" defaultValue={s.address.postalCode} required error={e.postalCode} inputMode="numeric" />
                    <TextField label="Ville" name="city" defaultValue={s.address.city} required error={e.city} />
                    <TextField label="Département" name="department" defaultValue={s.address.department} required error={e.department} />
                    <TextField label="N° de département" name="departmentCode" defaultValue={s.address.departmentCode} required error={e.departmentCode} />
                    <TextField label="Région" name="region" defaultValue={s.address.region} required error={e.region} />
                  </div>
                  <div className={styles.formRow}>
                    <TextField label="Zone (version courte)" name="serviceAreaShort" defaultValue={s.serviceArea.short} required error={e.serviceAreaShort} max={80} />
                  </div>
                  <TextArea label="Zone (phrase complète)" name="serviceAreaLong" rows={2} defaultValue={s.serviceArea.long} error={e.serviceAreaLong} max={300} />
                  <TextArea
                    label="Zones desservies"
                    name="serviceAreas"
                    rows={3}
                    defaultValue={s.serviceArea.areas.join('\n')}
                    hint="Une zone par ligne (données structurées). Avec « Île-de-France », les 8 départements sont listés sur le site."
                  />
                </fieldset>

                <fieldset className={styles.fieldset}>
                  <legend>Hébergement et données personnelles</legend>
                  <div className={styles.formRow}>
                    <TextField label="Hébergeur du site" name="hostName" defaultValue={s.host.name} required error={e.hostName} />
                    <TextField label="Site de l’hébergeur" name="hostWebsite" type="url" defaultValue={s.host.website} error={e.hostWebsite} />
                  </div>
                  <TextField label="Adresse de l’hébergeur" name="hostAddress" defaultValue={s.host.address} hint="À recopier depuis la page légale de l’hébergeur." />
                  <TextField
                    label="Conservation des demandes (mois)"
                    name="leadRetentionMonths"
                    type="number"
                    defaultValue={s.leadRetentionMonths}
                    error={e.leadRetentionMonths}
                    hint="Les demandes sans activité depuis cette durée sont supprimées automatiquement chaque nuit (6 à 120 mois)."
                  />
                </fieldset>

                <div className={`${styles.actions} ${styles.stickyActions}`}>
                  <SubmitButton>Enregistrer et publier</SubmitButton>
                </div>
              </>
            )
          }}
        />
      </Panel>
    </>
  )
}
