// Sécurité côté serveur : mots de passe, jetons, droits, export CSV, curseurs.
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hashPassword, needsRehash, temporaryPassword, verifyPassword } from '../../backend/modules/auth/password'
import { csvCell, leadsToCsv } from '../../backend/modules/leads/csv'
import { decodeCursor, encodeCursor } from '../../backend/modules/leads/repository'
import { isTokenFormat, keyedHash, newToken, safeEqual, sha256 } from '../../backend/security/tokens'
import { can } from '../../shared/auth/permissions'

describe('mots de passe (scrypt)', () => {
  it('hachage salé, vérification, refus d’un mauvais mot de passe', async () => {
    const a = await hashPassword('une phrase de passe très longue')
    const b = await hashPassword('une phrase de passe très longue')
    assert.match(a, /^scrypt\$17\$8\$1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/)
    assert.notEqual(a, b) // sel aléatoire
    assert.equal(await verifyPassword('une phrase de passe très longue', a), true)
    assert.equal(await verifyPassword('une phrase de passe tres longue', a), false)
    assert.equal(await verifyPassword('x', 'format-invalide'), false)
    assert.equal(needsRehash(a), false)
    assert.equal(needsRehash('scrypt$14$8$1$c2Fs$a2V5'), true)
  })
  it('mot de passe provisoire : 20 caractères sans ambiguïté (0/O, 1/l)', () => {
    const p = temporaryPassword()
    assert.match(p, /^[A-HJ-NP-Za-km-z2-9]{20}$/)
  })
})

describe('jetons', () => {
  it('256 bits en base64url, empreinte SHA-256, comparaison à temps constant', () => {
    const t = newToken()
    assert.equal(isTokenFormat(t), true)
    assert.equal(isTokenFormat(t + '='), false)
    assert.equal(isTokenFormat('../../etc/passwd'), false)
    assert.equal(sha256(t).length, 32)
    assert.equal(safeEqual(sha256(t), sha256(t)), true)
    assert.equal(safeEqual(sha256(t), sha256(newToken())), false)
    assert.equal(safeEqual(Buffer.from('a'), Buffer.from('ab')), false)
  })
  it('empreinte anti-abus : stable, différente selon la famille d’actions', () => {
    assert.deepEqual(keyedHash('demande', '1.2.3.4'), keyedHash('demande', '1.2.3.4'))
    assert.notDeepEqual(keyedHash('demande', '1.2.3.4'), keyedHash('connexion-ip', '1.2.3.4'))
  })
})

describe('droits des rôles', () => {
  it('matrice : propriétaire > éditeur > commercial', () => {
    const owner = { role: 'owner' as const }
    const editor = { role: 'editor' as const }
    const sales = { role: 'sales' as const }
    assert.deepEqual(
      (['manageLeads', 'deleteLeads', 'moderateReviews', 'editContent', 'manageUsers', 'viewAudit'] as const).map((p) => [
        p,
        can(owner, p),
        can(editor, p),
        can(sales, p),
      ]),
      [
        ['manageLeads', true, true, true],
        ['deleteLeads', true, true, false],
        ['moderateReviews', true, true, false],
        ['editContent', true, true, false],
        ['manageUsers', true, false, false],
        ['viewAudit', true, false, false],
      ]
    )
  })
})

describe('export CSV', () => {
  it('neutralise les formules et échappe les séparateurs', () => {
    assert.equal(csvCell('=SOMME(A1:A3)'), "'=SOMME(A1:A3)")
    assert.equal(csvCell('+33612345678'), "'+33612345678")
    assert.equal(csvCell('-2'), "'-2")
    assert.equal(csvCell('@cmd'), "'@cmd")
    assert.equal(csvCell('a;b'), '"a;b"')
    assert.equal(csvCell('dit "bonjour"\nligne 2'), '"dit ""bonjour""\nligne 2"')
    assert.equal(csvCell(null), '')
  })
  it('fichier lisible par Excel (BOM, « ; », dates françaises)', () => {
    const csv = leadsToCsv([
      {
        id: '7', cursorTs: '', createdAt: new Date('2026-03-01T09:30:00Z'), type: 'quote', status: 'new', name: 'Jean',
        company: null, email: 'jean@exemple.fr', phone: '+33612345678', location: 'Bondy', serviceNames: ['Vitres et façades'],
        otherNeed: true, assignedTo: null, notified: true, message: null, frequency: 'recurring', profile: 'company', surfaceM2: 120,
      },
    ])
    assert.equal(csv.charCodeAt(0), 0xfeff)
    const [header, row] = csv.slice(1).split('\r\n')
    assert.equal(header.split(';')[0], 'N°')
    assert.ok(row.startsWith('7;01/03/2026 10:30;Devis;Nouvelle;Jean;;jean@exemple.fr;06 12 34 56 78;Bondy;Vitres et façades, Autre besoin;'))
  })
})

describe('pagination par curseur', () => {
  it('aller-retour et rejet des curseurs falsifiés', () => {
    const c = encodeCursor('2026-03-01T09:30:00.123456Z', '42')
    assert.deepEqual(decodeCursor(c), { ts: '2026-03-01T09:30:00.123456Z', id: '42' })
    for (const bad of ['', 'nimporte-quoi', Buffer.from("2026-01-01T00:00:00Z|1;drop table").toString('base64url'), null]) {
      assert.equal(decodeCursor(bad), null, String(bad))
    }
  })
})
