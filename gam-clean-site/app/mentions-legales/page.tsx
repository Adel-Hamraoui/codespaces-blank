import Link from 'next/link'
import { PageHero } from '@/components/sections/PageHero'
import { ToConfirm } from '@/components/ui/ToConfirm'
import { company } from '@/content/site'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Mentions légales',
  description: 'Mentions légales du site GAM CLEAN : éditeur, hébergeur, propriété intellectuelle.',
  path: '/mentions-legales',
})

const formatSiret = (s: string) => s.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1 $2 $3 $4')

/** Affiche la valeur si elle est connue, sinon un marqueur visible « à confirmer ». */
const value = (v: string | null | undefined, label?: string) => (v ? v : <ToConfirm label={label} />)

export default function MentionsLegalesPage() {
  const a = company.address
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Mentions légales', path: '/mentions-legales' }]}
        title="Mentions légales"
        lead={<p>Informations prévues par l’article 6 de la loi n° 2004-575 du 21 juin 2004 (LCEN).</p>}
      />
      <section className="section">
        <div className="container prose">
          <h2>Éditeur du site</h2>
          <dl>
            <dt>Raison sociale</dt>
            <dd>{company.legalName}</dd>
            <dt>Forme juridique</dt>
            <dd>{value(company.legalForm)}</dd>
            <dt>Capital social</dt>
            <dd>{value(company.shareCapital)}</dd>
            <dt>Siège social</dt>
            <dd>
              {a.street ? `${a.street}, ` : <ToConfirm label="adresse complète" />} {a.postalCode} {a.city}
            </dd>
            <dt>SIRET</dt>
            <dd>{formatSiret(company.siret)}</dd>
            <dt>Immatriculation</dt>
            <dd>{value(company.registration, 'RCS / RNE')}</dd>
            <dt>N° de TVA intracommunautaire</dt>
            <dd>{company.vatNumber}</dd>
            <dt>Téléphone</dt>
            <dd>
              <a href={company.phone.href}>{company.phone.display}</a>
            </dd>
            <dt>E-mail</dt>
            <dd>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </dd>
            <dt>Directeur de la publication</dt>
            <dd>{value(company.publicationDirector)}</dd>
          </dl>

          <h2>Hébergement</h2>
          <dl>
            <dt>Hébergeur</dt>
            <dd>{company.host.name}</dd>
            <dt>Adresse</dt>
            <dd>{value(company.host.address, 'à recopier depuis vercel.com/legal')}</dd>
            <dt>Site</dt>
            <dd>
              <a href={company.host.website} rel="noopener noreferrer">
                {company.host.website.replace('https://', '')}
              </a>
            </dd>
          </dl>

          <h2>Propriété intellectuelle</h2>
          <p>
            Les contenus de ce site (textes, logo, éléments graphiques) sont la propriété de {company.legalName}, sauf
            mention contraire. Toute reproduction ou réutilisation, totale ou partielle, sans autorisation préalable est
            interdite.
          </p>

          <h2>Responsabilité</h2>
          <p>
            {company.legalName} s’efforce de fournir des informations exactes et à jour. Les informations présentées
            sur ce site ont une valeur indicative ; seul le devis établi après analyse de votre besoin engage
            l’entreprise.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Le traitement des données transmises via les formulaires est décrit dans la{' '}
            <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
          </p>

          <h2>Droit applicable</h2>
          <p>Le présent site et ses mentions légales sont soumis au droit français.</p>
        </div>
      </section>
    </>
  )
}
