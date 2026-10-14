# Informations à confirmer avec GAM CLEAN

Le site ne publie que des informations issues du site précédent ou confirmées. Ce qui manque est listé ci-dessous. Pour voir l'état à jour : `npm run check:content`.

## 1. Obligatoire avant la mise en ligne (mentions légales, LCEN)

| Information | Où la renseigner | État actuel |
|---|---|---|
| Forme juridique (SAS, SARL, EI…) | `content/site.ts` → `legalForm` | manquante |
| Capital social | `shareCapital` | manquant |
| Adresse complète du siège | `address.street` | manquante (le site précédent la disait « communiquée sur demande ») |
| Immatriculation RCS / RNE | `registration` | manquante |
| Directeur de la publication | `publicationDirector` | manquant |
| Adresse de l'hébergeur (Vercel) | `host.address` | à recopier depuis vercel.com/legal |
| Durée de conservation des demandes | `app/politique-de-confidentialite/page.tsx` | à définir (la CNIL recommande au plus 3 ans pour les prospects) |
| Garanties des transferts hors UE (Vercel, Resend) | idem | à vérifier dans les conditions de chaque prestataire |

## 2. À vérifier (repris du site précédent)

| Information | Valeur actuelle | Remarque |
|---|---|---|
| E-mail | `contact.gmaclean@gmail.com` | « gmaclean » ≠ « GAM CLEAN » : faute de frappe ? Une adresse sur un domaine propre est recommandée. |
| LinkedIn | `linkedin.com/company/gam-glean/about/` | « glean » ≠ « clean ». Non affiché tant que `confirmed: false`. |
| Téléphone | 07 51 37 94 55 | repris tel quel |
| SIRET / TVA | 103 309 571 00018 / FR48103309571 | numéros cohérents entre eux (clés vérifiées) ; existence à confirmer sur l'Annuaire des entreprises |
| Zone | Bondy (93), Seine-Saint-Denis, Île-de-France | repris tel quel |
| Prestations | 11 prestations de la plaquette | confirmer celles réellement pratiquées, en particulier ramonage, citernes, déneigement, plages, salles blanches |
| « Devis gratuit et sans engagement » | publié | repris du site précédent ; à reconfirmer |
| Visite des locaux avant devis | publié (méthode) | repris de la méthode décrite sur le site précédent |

## 3. Affirmations masquées tant qu'elles ne sont pas prouvées

Dans `content/site.ts` → `claims`, passer `confirmed: true` uniquement avec un justificatif :

| Affirmation | Justificatif attendu |
|---|---|
| Disponibles 7j/7 et 24h/24 | Organisation réelle (ligne d'astreinte effectivement joignable) |
| Cordistes qualifiés | Certificats de qualification des intervenants |
| Produits éco-responsables | Fiches produits / labels |
| Assurance RC professionnelle | Attestation d'assurance en cours |
| Protocoles QHSE | Documents de procédure |
| Personnel formé | Attestations de formation |

## 4. Recommandé pour renforcer la crédibilité

- Année de création (`foundedYear`)
- Code APE réel (`apeCode`)
- Horaires de joignabilité (`openingHours`)
- Délai de réponse aux demandes (`responseTime`), ex. « sous 24 heures ouvrées »
- Nom et photo du dirigeant, taille de l'équipe
- Témoignages réels, avec l'accord écrit des clients (`testimonials`)
- Références clients autorisées (`clientReferences`)
- Photos réelles (voir `docs/IMAGES.md`)
- Fiche Google Business Profile
