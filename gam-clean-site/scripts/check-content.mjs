// ============================================================================
// npm run check:content
// Liste les informations GAM CLEAN encore manquantes ou non confirmées dans
// content/site.ts. À relancer avant chaque mise en ligne.
// (Nécessite Node.js 22.18 ou plus récent, qui lit directement les fichiers .ts.)
// ============================================================================
const { company, claims, testimonials } = await import('../content/site.ts')

const missing = []
const check = (label, value, why) => {
  if (value === null || value === undefined || value === '') missing.push(`  ✗ ${label} — ${why}`)
}

check('Forme juridique', company.legalForm, 'obligatoire dans les mentions légales')
check('Capital social', company.shareCapital, 'obligatoire pour une société')
check('Adresse du siège', company.address.street, 'obligatoire dans les mentions légales')
check('Immatriculation RCS / RNE', company.registration, 'obligatoire dans les mentions légales')
check('Directeur de la publication', company.publicationDirector, 'obligatoire dans les mentions légales')
check('Adresse de l’hébergeur', company.host.address, 'obligatoire (voir vercel.com/legal)')
check('Code APE', company.apeCode, 'recommandé (page L’entreprise)')
check('Année de création', company.foundedYear, 'recommandé (crédibilité)')
check('Horaires', company.openingHours, 'recommandé (page Contact)')
check('Délai de réponse', company.responseTime, 'recommandé (formulaire, FAQ)')

const toVerify = [
  `  ? E-mail « ${company.email} » — orthographe « gmaclean » à confirmer ; idéalement une adresse sur domaine propre`,
]
if (!company.social.linkedin.confirmed) toVerify.push(`  ? LinkedIn « ${company.social.linkedin.url} » — non affiché tant que confirmed: false`)

const pendingClaims = Object.entries(claims)
  .filter(([, c]) => !c.confirmed)
  .map(([k, c]) => `  · ${c.title} (${k}) — masqué tant que non prouvé`)

console.log('\nGAM CLEAN — contrôle du contenu\n')
console.log(missing.length ? `Informations manquantes (${missing.length}) :\n${missing.join('\n')}` : '✓ Aucune information obligatoire manquante')
console.log(`\nÀ vérifier :\n${toVerify.join('\n')}`)
console.log(pendingClaims.length ? `\nAffirmations non publiées (passer confirmed: true si prouvées) :\n${pendingClaims.join('\n')}` : '\n✓ Toutes les affirmations sont confirmées')
console.log(`\nTémoignages publiés : ${testimonials.length}${testimonials.length === 0 ? ' (section masquée)' : ''}\n`)
