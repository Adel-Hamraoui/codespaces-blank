# Informations à confirmer avec GAM CLEAN

Le site ne publie que des informations issues du site précédent ou confirmées. Ce qui manque est listé ci-dessous.

Tout se renseigne dans **Back-office → Contenu du site** (compte propriétaire ou éditeur), et chaque enregistrement est publié immédiatement. **Le tableau de bord du back-office liste en permanence les informations encore manquantes** (encadré « Informations à compléter »).

Le contenu par défaut, utilisé pour initialiser la base et en secours si elle est injoignable, est dans `backend/modules/content/defaults.ts`. Une modification de ce fichier ne change pas une base déjà initialisée : utilisez le back-office.

## 1. Obligatoire avant la mise en ligne (mentions légales, LCEN)

Écran **Contenu du site → Coordonnées et informations légales**.

| Information | Champ | État actuel |
|---|---|---|
| Forme juridique (SAS, SARL, EI…) | « Forme juridique » | manquante |
| Capital social | « Capital social » | manquant |
| Adresse complète du siège | « Adresse du siège » | manquante (le site précédent la disait « communiquée sur demande ») |
| Immatriculation RCS / RNE | « Immatriculation (RCS / RNE) » | manquante |
| Directeur de la publication | « Directeur de la publication » | manquant |
| Adresse de l'hébergeur (Vercel) | « Adresse de l'hébergeur » | à recopier depuis vercel.com/legal |
| Durée de conservation des demandes | « Conservation des demandes (mois) » | **36 mois par défaut**, appliqués chaque nuit par la purge automatique : à valider (la CNIL recommande au plus 3 ans pour les prospects) |
| Garanties des transferts hors UE (Vercel, Resend, Supabase) | — | à vérifier dans les conditions de chaque prestataire ; créer la base Supabase dans une région de l'UE |

Tant qu'elles sont vides, ces informations s'affichent dans les mentions légales comme `[À confirmer avec GAM CLEAN]`.

## 2. À vérifier (repris du site précédent)

| Information | Valeur actuelle | Remarque |
|---|---|---|
| E-mail | `contact.gmaclean@gmail.com` | « gmaclean » ≠ « GAM CLEAN » : faute de frappe ? Une adresse sur un domaine propre est recommandée. |
| LinkedIn | `linkedin.com/company/gam-glean/about/` | « glean » ≠ « clean ». N'est utilisé (données structurées destinées aux moteurs de recherche) qu'une fois la case « Lien LinkedIn vérifié » cochée. |
| Téléphone | 07 51 37 94 55 | repris tel quel |
| SIRET / TVA | 103 309 571 00018 / FR48103309571 | numéros cohérents entre eux (clés vérifiées) ; existence à confirmer sur l'Annuaire des entreprises |
| Zone | Bondy (93), Seine-Saint-Denis, Île-de-France | repris tel quel |
| Prestations | 11 prestations de la plaquette | confirmer celles réellement pratiquées, en particulier ramonage, citernes, déneigement, plages, salles blanches. Une prestation non pratiquée se **dépublie** (Contenu du site → Prestations) |
| « Devis gratuit et sans engagement » | publié | repris du site précédent ; à reconfirmer (Contenu du site → Affirmations commerciales) |
| Visite des locaux avant devis | publié (méthode) | repris de la méthode décrite sur le site précédent |

## 3. Affirmations masquées tant qu'elles ne sont pas prouvées

Écran **Contenu du site → Affirmations commerciales** : ne cochez « confirmée » qu'avec un justificatif.

| Affirmation | Justificatif attendu |
|---|---|
| Disponibles 7j/7 et 24h/24 | Organisation réelle (ligne d'astreinte effectivement joignable) |
| Cordistes qualifiés | Certificats de qualification des intervenants |
| Produits éco-responsables | Fiches produits / labels |
| Assurance responsabilité civile professionnelle | Attestation d'assurance en cours |
| Protocoles de sécurité | Documents de procédure |
| Personnel formé | Attestations de formation |

## 4. Recommandé pour renforcer la crédibilité

- Année de création (« Année de création »)
- Code APE réel (« Code APE »)
- Horaires de joignabilité (« Horaires de joignabilité »)
- Délai de réponse aux demandes (« Délai de réponse »), par exemple « sous 24 heures ouvrées », uniquement s'il est tenu
- Nom et photo du dirigeant, taille de l'équipe
- **Avis clients réels** : envoyez une invitation depuis la fiche d'une demande gagnée (lien personnel à usage unique). Seuls les avis déposés par les clients, avec leur accord de publication, peuvent être publiés.
- Photos réelles (voir [`IMAGES.md`](IMAGES.md))
- Fiche Google Business Profile
