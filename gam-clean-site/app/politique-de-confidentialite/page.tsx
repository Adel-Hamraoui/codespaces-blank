import { PageHero } from '@/components/sections/PageHero'
import { ToConfirm } from '@/components/ui/ToConfirm'
import { company } from '@/content/site'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Politique de confidentialité',
  description:
    'Comment GAM CLEAN traite les données transmises via les formulaires de devis et de contact : finalités, durée de conservation, destinataires, droits.',
  path: '/politique-de-confidentialite',
})

export default function ConfidentialitePage() {
  const analytics = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER
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
            {company.legalName}, SIRET {company.siret}, {company.address.postalCode} {company.address.city}. Contact :{' '}
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
          <p>Ne transmettez pas de données sensibles (santé, opinions…) dans le champ de message.</p>

          <h2>Finalités et bases légales</h2>
          <ul>
            <li>
              Répondre à votre demande de devis et l’établir : mesures précontractuelles prises à votre demande
              (article 6.1.b du RGPD).
            </li>
            <li>
              Répondre à vos messages et assurer le suivi commercial de votre demande : intérêt légitime de{' '}
              {company.name} (article 6.1.f du RGPD).
            </li>
          </ul>
          <p>Vos données ne sont ni vendues, ni cédées, ni utilisées pour de la prospection sans votre accord.</p>

          <h2>Durée de conservation</h2>
          <p>
            <ToConfirm label="durée de conservation" /> Pour les données de prospects, la CNIL recommande une durée
            maximale de 3 ans à compter du dernier contact.
          </p>

          <h2>Destinataires et sous-traitants</h2>
          <p>
            Les données sont destinées aux seules personnes de {company.legalName} chargées de traiter les demandes.
            Elles transitent par des prestataires techniques agissant pour notre compte :
          </p>
          <ul>
            <li>hébergement du site : {company.host.name} ;</li>
            <li>transmission des demandes par e-mail : Resend ;</li>
            <li>messagerie de réception des demandes : prestataire de la boîte e-mail de {company.name}.</li>
          </ul>
          <p>
            Certains de ces prestataires sont établis hors de l’Union européenne. Garanties encadrant ces transferts :{' '}
            <ToConfirm label="à vérifier dans les conditions de chaque prestataire" />
          </p>

          <h2>Cookies et mesure d’audience</h2>
          {analytics ? (
            <p>
              Ce site utilise une mesure d’audience sans cookie ({analytics === 'vercel' ? 'Vercel Web Analytics' : 'Plausible Analytics'}),
              qui ne permet pas de vous identifier personnellement. Aucun cookie publicitaire n’est déposé.
            </p>
          ) : (
            <p>Ce site ne dépose aucun cookie de mesure d’audience ni de publicité.</p>
          )}

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
            Le site est servi en HTTPS. Les formulaires sont protégés contre les envois automatisés et les données ne
            sont pas stockées dans le navigateur.
          </p>
        </div>
      </section>
    </>
  )
}
