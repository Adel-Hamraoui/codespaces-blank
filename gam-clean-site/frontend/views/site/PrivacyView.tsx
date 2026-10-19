import { PageHero } from '@/frontend/components/sections/PageHero'
import { ToConfirm } from '@/frontend/components/ui/ToConfirm'
import type { SiteSettings } from '@/shared/types/content'

type Props = {
  settings: SiteSettings
  /** Fournisseur de mesure d'audience configuré (variable publique), ou null. */
  analytics: string | null
}

export function PrivacyView({ settings: company, analytics }: Props) {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Politique de confidentialité', path: '/politique-de-confidentialite' }]}
        title="Politique de confidentialité"
        lead={<p>Les données que vous nous transmettez servent uniquement à répondre à votre demande.</p>}
      />
      <section className="section">
        <div className="container prose">
          <h2>Responsable du traitement</h2>
          <p>
            {company.legalName}, SIRET {company.siret}, {company.address.postalCode} {company.address.city}. Contact :{' '}
            <a href={`mailto:${company.email}`}>{company.email}</a>.
          </p>

          <h2>Données collectées</h2>
          <p>Via les formulaires de demande de devis et de contact :</p>
          <ul>
            <li>nom et prénom, société ou organisme (facultatif) ;</li>
            <li>adresse e-mail et numéro de téléphone ;</li>
            <li>ville ou code postal des locaux, surface approximative, profil ;</li>
            <li>prestations souhaitées, fréquence et contenu de votre message.</li>
          </ul>
          <p>
            Via le formulaire d’avis client (lien personnel envoyé après une intervention) : note, commentaire, nom
            affiché, société (facultatif) et votre choix concernant la publication.
          </p>
          <p>Ne transmettez pas de données sensibles (santé, opinions…) dans les champs de message.</p>

          <h2>Finalités et bases légales</h2>
          <ul>
            <li>
              Répondre à votre demande de devis et l’établir : mesures précontractuelles prises à votre demande
              (article 6.1.b du RGPD).
            </li>
            <li>
              Répondre à vos messages et assurer le suivi commercial de votre demande : intérêt légitime de{' '}
              {company.companyName} (article 6.1.f du RGPD).
            </li>
            <li>
              Recueillir votre avis sur une prestation : intérêt légitime (amélioration du service). Sa publication sur le
              site repose sur votre consentement (article 6.1.a du RGPD), que vous pouvez retirer à tout moment : l’avis
              est alors retiré du site.
            </li>
          </ul>
          <p>Vos données ne sont ni vendues, ni cédées, ni utilisées pour de la prospection sans votre accord.</p>

          <h2>Durée de conservation</h2>
          <p>
            Les demandes enregistrées dans notre outil de suivi sont supprimées automatiquement{' '}
            {company.leadRetentionMonths} mois après leur dernière mise à jour. Pour les données de prospects, la CNIL
            recommande une durée maximale de 3 ans à compter du dernier contact.
          </p>
          <p>
            Copies reçues dans notre messagerie et avis clients : <ToConfirm label="durée de conservation" />
          </p>

          <h2>Destinataires et sous-traitants</h2>
          <p>
            Les données sont destinées aux seules personnes de {company.legalName} chargées de traiter les demandes,
            chacune disposant d’un accès nominatif. Elles transitent par des prestataires techniques agissant pour notre
            compte :
          </p>
          <ul>
            <li>hébergement du site : {company.host.name} ;</li>
            <li>
              hébergement de la base de données : Supabase (région d’hébergement :{' '}
              <ToConfirm label="région choisie lors de la création du projet" />) ;
            </li>
            <li>transmission des demandes par e-mail : Resend ;</li>
            <li>messagerie de réception des demandes : prestataire de la boîte e-mail de {company.companyName}.</li>
          </ul>
          <p>
            Certains de ces prestataires sont établis hors de l’Union européenne. Garanties encadrant ces transferts :{' '}
            <ToConfirm label="à vérifier dans les conditions de chaque prestataire" />
          </p>

          <h2>Cookies et mesure d’audience</h2>
          {analytics ? (
            <p>
              Ce site utilise une mesure d’audience sans cookie (
              {analytics === 'vercel' ? 'Vercel Web Analytics' : 'Plausible Analytics'}), qui ne permet pas de vous
              identifier personnellement. Aucun cookie publicitaire n’est déposé.
            </p>
          ) : (
            <p>Ce site ne dépose aucun cookie de mesure d’audience ni de publicité.</p>
          )}
          <p>
            Un cookie de session strictement nécessaire est utilisé uniquement dans l’espace d’administration réservé à
            l’équipe de {company.companyName}.
          </p>

          <h2>Vos droits</h2>
          <p>
            Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de
            portabilité de vos données. Pour les exercer, écrivez à{' '}
            <a href={`mailto:${company.email}`}>{company.email}</a>. Vous pouvez également introduire une réclamation
            auprès de la CNIL (
            <a href="https://www.cnil.fr" rel="noopener noreferrer">
              www.cnil.fr
            </a>
            ).
          </p>

          <h2>Sécurité</h2>
          <p>
            Le site est servi en HTTPS. Les formulaires sont protégés contre les envois automatisés. L’accès aux
            demandes est réservé à des comptes nominatifs protégés par mot de passe ; les modifications, exports et
            suppressions de données sont journalisés.
          </p>
        </div>
      </section>
    </>
  )
}
