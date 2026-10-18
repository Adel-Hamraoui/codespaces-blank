// Validation partagée (navigateur + serveur) : formats, normalisation, messages.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatPhone, parseIntIn, safeInternalPath, toE164 } from '../../shared/validation/common'
import { sanitizeRequest, validateRequest } from '../../shared/validation/request'
import { formatGroups, formatSteps, parseGroups, parseSteps, slugify, validateService, validateSettings } from '../../shared/validation/content'
import { filtersToQuery, parseLeadFilters } from '../../shared/validation/filters'
import { passwordProblem } from '../../shared/validation/user'
import { validateReview, validateReviewRequest } from '../../shared/validation/review'

describe('téléphones', () => {
  it('normalise les formats français courants en E.164', () => {
    for (const raw of ['06 12 34 56 78', '0612345678', '06.12.34.56.78', '+33 6 12 34 56 78', '0033612345678', '+33 (0)6 12 34 56 78'.replace('(0)', '')]) {
      assert.equal(toE164(raw), '+33612345678', raw)
    }
  })
  it('refuse les numéros invalides', () => {
    for (const raw of ['', '12345', '0012', '06 12 34 56', '+33 0 12 34 56 78', 'abcdefghij']) {
      assert.equal(toE164(raw), null, raw)
    }
  })
  it('accepte un numéro étranger valide', () => {
    assert.equal(toE164('+32 470 12 34 56'), '+32470123456')
  })
  it('affiche un numéro français par paires', () => {
    assert.equal(formatPhone('+33751379455'), '07 51 37 94 55')
    assert.equal(formatPhone('+32470123456'), '+32470123456')
    assert.equal(formatPhone(null), '')
  })
})

describe('nombres et adresses internes', () => {
  it('lit une surface saisie librement', () => {
    assert.equal(parseIntIn('1 200 m²', 1, 1_000_000), 1200)
    assert.equal(parseIntIn('250m2', 1, 1_000_000), 250)
    assert.equal(parseIntIn('12,6', 1, 100), 13)
    assert.equal(parseIntIn('', 1, 10), null)
    assert.equal(parseIntIn('abc', 1, 10), 'invalid')
    assert.equal(parseIntIn('0', 1, 10), 'invalid')
  })
  it('n’autorise que des chemins internes (pas de redirection ouverte)', () => {
    assert.equal(safeInternalPath('/admin/demandes?statut=new'), '/admin/demandes?statut=new')
    for (const evil of ['//exemple.com', 'https://exemple.com', '/\\exemple.com', 'javascript:alert(1)', '', null]) {
      assert.equal(safeInternalPath(evil, '/admin'), '/admin', String(evil))
    }
  })
})

describe('demandes publiques', () => {
  const services = ['nettoyage-de-bureaux', 'vitres-et-facades']

  it('ne garde que des prestations publiées (plus « autre »), sans doublon', () => {
    const d = sanitizeRequest({ type: 'devis', services: ['vitres-et-facades', 'inconnue', 'autre', 'vitres-et-facades'] }, services)
    assert.deepEqual(d.services, ['vitres-et-facades', 'autre'])
  })

  it('exige les champs d’un devis et explique chaque erreur', () => {
    const { errors, data } = validateRequest(sanitizeRequest({ type: 'devis', email: 'pas-un-email', name: 'A' }, services))
    assert.equal(data, null)
    assert.deepEqual(Object.keys(errors).sort(), ['email', 'location', 'name', 'phone', 'services'])
  })

  it('normalise une demande valide', () => {
    const { errors, data } = validateRequest(
      sanitizeRequest(
        {
          type: 'devis',
          services: ['nettoyage-de-bureaux', 'autre'],
          frequency: 'recurring',
          location: '  Bondy  ',
          surface: '1 200',
          name: 'Jeanne Martin',
          phone: '06 12 34 56 78',
          email: '  Jeanne.Martin@Exemple.FR ',
          message: 'x'.repeat(5000),
        },
        services
      )
    )
    assert.deepEqual(errors, {})
    assert.ok(data)
    assert.equal(data.email, 'jeanne.martin@exemple.fr')
    assert.equal(data.phoneE164, '+33612345678')
    assert.equal(data.location, 'Bondy')
    assert.equal(data.surfaceM2, 1200)
    assert.deepEqual(data.serviceSlugs, ['nettoyage-de-bureaux'])
    assert.equal(data.otherNeed, true)
    assert.equal(data.message.length, 3000) // tronqué à la limite de la base
  })

  it('formulaire de contact : message obligatoire, téléphone facultatif', () => {
    const base = { type: 'contact', name: 'Paul', email: 'paul@exemple.fr' }
    assert.ok(validateRequest(sanitizeRequest(base, services)).errors.message)
    const ok = validateRequest(sanitizeRequest({ ...base, message: 'Bonjour, merci de me rappeler.' }, services))
    assert.deepEqual(ok.errors, {})
    assert.equal(ok.data?.phoneE164, null)
    assert.equal(ok.data?.frequency, '') // champs propres au devis ignorés
  })

  it('champs d’une ligne : retours à la ligne neutralisés (objet des e-mails)', () => {
    const d = sanitizeRequest({ type: 'contact', name: 'Jean\r\nBcc: pirate@exemple.fr', message: 'Ligne 1\nLigne 2' }, services)
    assert.equal(d.name, 'Jean Bcc: pirate@exemple.fr')
    assert.equal(d.message, 'Ligne 1\nLigne 2') // le message garde ses paragraphes
  })

  it('ignore les valeurs hors liste (fréquence, profil)', () => {
    const d = sanitizeRequest({ type: 'devis', frequency: 'tous-les-jours', profile: 'admin' }, services)
    assert.equal(d.frequency, '')
    assert.equal(d.profile, '')
  })
})

describe('contenus éditables', () => {
  it('fabrique des adresses de page lisibles', () => {
    assert.equal(slugify('Vitres & façades — Île-de-France'), 'vitres-facades-ile-de-france')
    assert.equal(slugify('  Après sinistre ! '), 'apres-sinistre')
  })

  it('étapes « Titre :: texte » : lecture et réécriture identiques', () => {
    const steps = parseSteps('Visite :: Nous venons voir les locaux.\nligne invalide\nDevis :: Envoyé sous :: forme écrite.')
    assert.deepEqual(steps, [
      { title: 'Visite', text: 'Nous venons voir les locaux.' },
      { title: 'Devis', text: 'Envoyé sous :: forme écrite.' },
    ])
    assert.deepEqual(parseSteps(formatSteps(steps)), steps)
  })

  it('groupes « ## Titre | icône » : lecture, icône par défaut, réécriture', () => {
    const groups = parseGroups('## Zones sensibles | medical\n- Salles blanches\n- Laboratoires\n\n## Sans point\n## Voiries | inconnue\n- Parkings')
    assert.deepEqual(groups.map((g) => [g.id, g.icon, g.points.length]), [
      ['zones-sensibles', 'medical', 2],
      ['voiries', 'layers', 1],
    ])
    assert.deepEqual(parseGroups(formatGroups(groups)), groups)
  })

  it('prestation : contraintes alignées sur la base', () => {
    const { errors, data } = validateService({ name: 'Désinfection', summary: 'court', metaTitle: 'x', metaDescription: 'y', h1: 'Titre de page', imageKey: 'poste-de-travail' })
    assert.equal(data.slug, 'desinfection')
    assert.ok(errors.summary && errors.metaTitle && errors.metaDescription && errors.intro && errors.imageAlt)
    assert.equal(validateService({ imageKey: '../../etc/passwd' }).data.imageKey, null)
  })

  it('coordonnées : téléphone normalisé, formats légaux contrôlés', () => {
    const { errors, data } = validateSettings({
      companyName: 'GAM CLEAN', legalName: 'GAM CLEAN', siret: '103 309 571 00018', vatNumber: 'fr48 103309571',
      phone: '07 51 37 94 55', email: 'Contact@Exemple.fr', postalCode: '93140', city: 'Bondy', department: 'Seine-Saint-Denis',
      departmentCode: '93', region: 'Île-de-France', serviceAreaShort: 'Bondy (93)', serviceAreaLong: 'Basés à Bondy, nous intervenons partout.',
      hostName: 'Vercel Inc.', openingHours: 'Du lundi au vendredi : 8 h – 18 h\nLe samedi : 9 h – 12 h', leadRetentionMonths: '24',
    })
    assert.deepEqual(errors, {})
    assert.equal(data.siret, '10330957100018')
    assert.equal(data.vatNumber, 'FR48103309571')
    assert.equal(data.phoneE164, '+33751379455')
    assert.equal(data.email, 'contact@exemple.fr')
    assert.deepEqual(data.openingHours, [
      { days: 'Du lundi au vendredi', hours: '8 h – 18 h' },
      { days: 'Le samedi', hours: '9 h – 12 h' },
    ])
    assert.equal(data.leadRetentionMonths, 24)
    const bad = validateSettings({ siret: '123', apeCode: '8121', leadRetentionMonths: '500', linkedinUrl: 'http://evil.test' }).errors
    assert.ok(bad.siret && bad.apeCode && bad.leadRetentionMonths && bad.linkedinUrl)
  })
})

describe('filtres du back-office', () => {
  it('ignore les valeurs invalides et conserve les autres', () => {
    const f = parseLeadFilters(new URLSearchParams('statut=won&type=pirate&prestation=3&assigne=-1&q=%20a%20&du=2026-01-01&au=demain'))
    assert.deepEqual(f, { status: 'won', type: undefined, serviceId: 3, assignedToId: undefined, q: undefined, from: '2026-01-01', to: undefined })
  })
  it('aller-retour URL ↔ filtres', () => {
    const f = { status: 'new' as const, type: 'quote' as const, q: 'Évry', from: '2026-02-01' }
    assert.deepEqual(parseLeadFilters(new URLSearchParams(filtersToQuery(f).slice(1))), { ...f, serviceId: undefined, assignedToId: undefined, to: undefined })
  })
})

describe('mots de passe et avis', () => {
  it('impose la longueur et refuse l’identifiant dans le mot de passe', () => {
    assert.match(passwordProblem('court') ?? '', /12 caractères/)
    assert.match(passwordProblem('marie.dupont-2026-secret', 'marie.dupont@exemple.fr') ?? '', /identifiant/)
    assert.match(passwordProblem('aaaaaaaaaaaaaaaa') ?? '', /trop simple/)
    assert.equal(passwordProblem('une phrase de passe facile à retenir'), null)
  })
  it('avis : note obligatoire, consentement explicite', () => {
    const { errors, data } = validateReview({ rating: '7', comment: 'Très bien', authorName: 'A' })
    assert.ok(errors.rating && errors.comment && errors.authorName)
    assert.equal(data.consentPublish, false)
    assert.equal(validateReview({ rating: '5', comment: 'Travail soigné.', authorName: 'Léa', consentPublish: 'true' }).data.consentPublish, true)
  })
  it('invitation : e-mail requis seulement pour un envoi', () => {
    assert.ok(validateReviewRequest({ clientName: 'Léa', sendEmail: 'true' }).errors.clientEmail)
    assert.deepEqual(validateReviewRequest({ clientName: 'Léa', leadId: '12' }).errors, {})
    assert.equal(validateReviewRequest({ clientName: 'Léa', leadId: '12; drop table' }).data.leadId, null)
  })
})
