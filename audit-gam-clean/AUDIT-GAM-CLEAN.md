# Audit du site vitrine GAM CLEAN

> **Date de l'audit :** 13 octobre 2026
> **Objet :** audit UX/UI, contenu, conversion, SEO, performance, mobile, accessibilité (WCAG 2.2 AA), technique et sécurité défensive. Sert de base de décision pour la refonte (Vercel).
> **Périmètre réellement audité :** le **code source de la version 3**, compilé et exécuté **localement**. Les versions 1 et 2 ont été comparées. L'URL sandbox n'a **pas pu être inspectée** (voir §2).

---

## 1. Synthèse exécutive

### 1.1 Appréciation globale

Le site (version 3) a une **base solide en apparence et dans sa structure**. On y trouve :
- une architecture multi-pages cohérente ;
- un CTA « Demander un devis gratuit » omniprésent ;
- des balises SEO de base complètes (title, meta description, H1 unique, JSON-LD) ;
- un lien d'évitement et une langue déclarée ;
- un code serveur globalement prudent : requêtes SQL paramétrées, échappement HTML des e-mails et des avis.

Cette façade masque cependant **trois défauts bloquants** qui touchent directement les trois objectifs commerciaux :

1. **Des demandes peuvent être perdues sans que personne le sache** (vérifié dans le code). L'API `/api/contact` répond « Votre demande a bien été envoyée » même quand l'e-mail de notification n'est pas parti, et même quand l'enregistrement en base a échoué. Il n'existe **aucune interface** pour consulter les demandes stockées. Le mode « bac à sable » de Resend, documenté dans le README, ne livre qu'à l'adresse du compte Resend.
2. **Sur mobile, le site déborde horizontalement sur toutes les pages** (vérifié en émulation à 360 et 390 px : largeur de document de 627 px). Le pied de page conserve sa grille à 4 colonnes. Conséquence directe : la **barre fixe « Appeler / Devis gratuit » est sortie de l'écran** (mesurée à y = 1284 px pour une hauteur d'écran de 844 px). Le principal levier d'appel sur mobile est donc neutralisé.
3. **Le champ « Fréquence souhaitée » du formulaire de devis n'est jamais transmis** (vérifié : absent de la requête envoyée). Une information de qualification affichée au prospect est perdue.

S'y ajoutent des **risques de crédibilité et de conformité** :
- mentions légales publiées avec des encarts « information à compléter » (hébergeur, directeur de publication, adresse) ;
- affirmation inexacte selon laquelle les codes NAF « attestent » d'une « habilitation » ;
- section « Avis vérifiés » vide ;
- adresse e-mail Gmail dont l'orthographe (`gmaclean`) ne correspond pas à la marque.

### 1.2 Forces principales (à conserver)

- **Données centralisées** (`src/lib/data.ts`) : services, FAQ et coordonnées sont réutilisables pour la refonte.
- **Parcours de devis omniprésent** : en-tête, hero, fin de chaque page, cartes services, barre mobile (une fois réparée).
- **Prudence rédactionnelle de la v3** : les faux témoignages de la v1 ont été retirés (voir §5.3) et les inconnues sont signalées plutôt qu'inventées.
- **Bases SEO** : un H1 unique par page, des titles uniques, un JSON-LD `CleaningService` + `FAQPage`, un sitemap et un robots.txt.
- **Bases d'accessibilité** : `lang="fr"`, lien d'évitement, landmarks, labels associés aux champs, `role="status"` sur le retour des formulaires, prise en compte de `prefers-reduced-motion` pour les animations d'apparition.
- **Sécurité serveur** : requêtes D1 paramétrées, échappement HTML, secrets admin hors du code, avis publiés seulement après modération.

### 1.3 Faiblesses et risques majeurs

| Risque | Nature | Objectif touché |
|---|---|---|
| Perte silencieuse de demandes de devis | Technique / business | Devis, contact |
| Débordement mobile et barre d'appel invisible | UX / accessibilité (WCAG 1.4.10) | Appels, devis |
| En-tête cassé entre 861 et environ 1100 px (navigation de 364 px de haut à 900 px) | UI | Tous |
| Mentions légales incomplètes publiées en l'état | Juridique (LCEN) / confiance | Crédibilité |
| Allégations non étayées : NAF « habilitation », QHSE, assurances, cordistes, « garantie de résultat », 24h/24 7j/7 | Juridique (pratiques commerciales) / confiance | Crédibilité |
| Canonical et `og:url` codés en dur vers un domaine Genspark | SEO / migration | Visibilité |
| Page 404 renvoyée avec un statut HTTP 200 (soft 404) | SEO | Visibilité |
| Réponse API exposant des informations de débogage | Sécurité (divulgation) | — |
| Aucun anti-spam ni limite de taille sur `/api/contact` (message de 200 000 caractères accepté) | Sécurité / exploitation | Devis |

### 1.4 Recommandations prioritaires

1. **Fiabiliser la réception des demandes** : ne répondre « succès » qu'après persistance confirmée, configurer un envoi d'e-mail vers un domaine vérifié, ajouter un canal de secours et une vue d'administration des demandes.
2. **Corriger le débordement mobile** (grille du pied de page) et contrôler l'absence de défilement horizontal à 320, 360 et 390 px.
3. **Transmettre le champ `frequency`** dans `public/static/app.js`.
4. **Réparer l'en-tête entre 861 et 1200 px** : réduire la navigation à 5 ou 6 entrées, ou basculer en menu burger plus tôt.
5. **Compléter les mentions légales** avec des informations réelles, ou retirer le site de l'indexation tant qu'elles manquent.
6. **Retirer ou justifier chaque allégation** : NAF, QHSE, assurances, cordistes, garantie, disponibilité 24h/24.
7. **Masquer la section « Ce que disent nos clients »** tant qu'aucun avis n'est publié.
8. **Rendre canonical, `og:url` et sitemap dépendants du domaine de production**, et renvoyer un vrai 404.
9. **Supprimer `debug` des réponses API** ; ajouter un honeypot, une limite de taille par champ et une limitation de débit.
10. **Corriger les contrastes** du pied de page (texte de copyright quasi invisible, ratio 1,11:1) et les liens verts.

### 1.5 Capacité actuelle du site face aux trois objectifs

| Objectif | Verdict | Justification |
|---|---|---|
| Générer des devis | **Insuffisant en l'état** | CTA bien visibles, mais formulaire long (7 champs obligatoires, dont l'adresse complète), un champ perdu, et risque de perte silencieuse des demandes. |
| Favoriser appels et contacts | **Correct sur desktop, dégradé sur mobile** | Téléphone visible partout sur desktop. Sur mobile, la barre d'appel est sortie de l'écran et le bloc Contact du pied de page est hors champ. |
| Présenter et crédibiliser | **Faible** | Contenu générique et répétitif, aucune preuve vérifiable (réalisations, avis, photos d'équipe, certifications documentées), mentions légales incomplètes, e-mail Gmail. |

### 1.6 Critique contradictoire et niveau de confiance

- **Biais d'environnement.** L'audit porte sur la v3 exécutée localement avec `wrangler pages dev`, pas sur le site hébergé. Si la sandbox servait la v1 ou la v2, certains constats diffèrent (notamment les témoignages non sourcés de la v1). Les constats CSS, mobile et formulaire sont toutefois communs aux trois versions sur les points testés : grille du pied de page identique, même `app.js` pour la fréquence (la v1 n'a pas ce champ).
- **Biais de mesure.** Les performances sont des mesures de **laboratoire** sur localhost (Lighthouse en throttling simulé). Elles ne remplacent pas des données terrain, qui n'existent pas pour un domaine de démonstration.
- **Biais d'interprétation.** Je qualifie de « non étayées » des allégations dont GAM CLEAN détient peut-être les preuves. Elles ne sont pas fausses : elles sont **non démontrées sur le site**, ce qui suffit à affaiblir la confiance d'un acheteur B2B.
- **Confiance globale : environ 80 %** (estimation qualitative, pas une mesure). Elle est élevée pour les défauts vérifiés par l'exécution : débordement, champ perdu, réponse de succès inconditionnelle, contrastes, soft 404. Elle est plus faible pour le comportement de l'hébergement réel (en-têtes HTTP, cache, cookies Google Maps) et pour l'exactitude des informations commerciales.

---

## 2. Méthodologie et périmètre

| Élément | Détail |
|---|---|
| URL de départ | `https://3000-i7dudati9emth98rdxju2-2e1b9533.sandbox.gensparksite.com/` |
| Accès à l'URL | **Échec.** Le proxy réseau de l'environnement refuse la connexion (HTTP 403) et la résolution DNS échoue via WebFetch (`ENOTFOUND`). Impossible de distinguer un blocage par la politique réseau d'une sandbox expirée. **Aucun constat de ce rapport ne provient de l'URL sandbox.** |
| Source réellement auditée | Archives fournies : `Code_site_vitrine_GAM_CLEAN_version_1/2/3.zip` (projet Hono + Vite pour Cloudflare Pages avec base D1). La **v3**, la plus récente et la plus complète, a été compilée (`vite build`), migrée en local (4 migrations D1) et servie par `wrangler pages dev` sur `127.0.0.1:3000`. |
| Logo fourni | Image 1024×1024 « GC + GAM CLEAN » sur fond bleu nuit, comparée au fichier `public/static/images/logo.png` (287×184). |
| Pages inspectées (rendues) | `/`, `/services`, `/secteurs`, `/notre-methode`, `/nos-engagements`, `/qui-sommes-nous`, `/references`, `/faq`, `/devis`, `/nous-localiser`, `/contact`, `/mentions-legales`, `/politique-de-confidentialite`, `/satisfaction-client`, une URL inexistante, `/robots.txt`, `/sitemap.xml`, `/gestion-avis` (statut seulement) |
| Outils | Chromium (Playwright) avec exécution JavaScript ; axe-core 4 (règles WCAG 2.0/2.1/2.2 A et AA et bonnes pratiques) ; Lighthouse 12 (mobile et desktop) ; curl pour les statuts et en-têtes ; lecture complète du code TSX, JS et CSS et des migrations SQL. |
| Viewports testés | 360, 390, 768, 1024 et 1440 px pour les 15 pages ; 320 px (reflow) ; 900 px (en-tête) ; émulation mobile (`isMobile`, tactile) sous 800 px. |
| Tests manuels | Parcours clavier de l'accueil (22 tabulations), menu mobile (ouverture, Échap), FAQ au clavier, carrousel en mouvement réduit, soumission du formulaire de devis vide, partiel et invalide (**sur l'instance locale uniquement**, sans envoi d'e-mail puisqu'aucune clé n'était configurée), envoi d'un message surdimensionné à l'API locale, soumission d'un avis sans consentement à l'API locale. |
| Données terrain (CrUX) | **Indisponibles** : domaine de démonstration non joignable. |
| Limitations | Font Awesome (cdn.jsdelivr.net) bloqué par le proxy : il a été servi en local, à version identique (6.4.0), pour les tests Playwright, mais **pas** pour Lighthouse, dont le poids total sous-estime donc d'environ 360 Ko. Google Maps et LinkedIn étaient injoignables. Les en-têtes HTTP de production (Cloudflare Pages) n'ont pas pu être observés. |

---

## 3. Cartographie du site

### 3.1 Inventaire des pages (v3)

| URL | Rôle | Objectif supposé | CTA principal | État | Observations principales |
|---|---|---|---|---|---|
| `/` | Accueil | Orienter vers devis et services | « Demander un devis gratuit » | 200 | 805 mots ; carrousel de 3 images ; 9 sections ; même image pour les 6 cartes services |
| `/services` | Catalogue | Présenter 11 prestations en 4 catégories | « Demander un devis » (par carte) | 200 | Pas de page par service ; encadré NAF « habilitée » |
| `/secteurs` | Cibles | 6 secteurs : problème et réponse | « Demander un devis » | 200 | H1 identique au H2 de l'accueil (« Nos solutions selon votre activité ») |
| `/notre-methode` | Process | 6 étapes | Devis + téléphone | 200 | 173 mots (contenu mince) |
| `/nos-engagements` | Réassurance | 6 engagements | Devis | 200 | 177 mots, sans preuve associée |
| `/qui-sommes-nous` | Entreprise | Vision, approche, NAF, informations légales | Devis / Contact | 200 | Aucun élément humain : dirigeant, équipe, date de création |
| `/references` | Preuve sociale | Secteurs + avis publiés | « Rejoindre nos clients » | 200 | Hors navigation principale ; section avis vide (« Aucun avis publié pour le moment ») |
| `/faq` | Objections | 17 questions + JSON-LD `FAQPage` | Devis | 200 | Accordéon sans `aria-expanded` |
| `/devis` | Conversion | Formulaire de devis | « Envoyer ma demande de devis » | 200 | Hors navigation principale (accès par les CTA) ; champ fréquence non transmis |
| `/nous-localiser` | Local | Carte Google Maps et coordonnées | Devis | 200 | 65 mots ; adresse « communiquée sur demande » ; hors navigation principale |
| `/contact` | Contact | Téléphone, e-mail, formulaire | « Envoyer le message » | 200 | Même formulaire que le devis (adresse obligatoire même pour une simple question) |
| `/mentions-legales` | Légal | Mentions LCEN | — | 200 | Trois encarts « information à compléter » publiés |
| `/politique-de-confidentialite` | Légal | RGPD | — | 200 | Durée de conservation non chiffrée ; encart « à compléter » |
| `/satisfaction-client` | Privée | Collecte d'avis | « Envoyer mon avis » | 200, noindex | Accessible publiquement sans jeton ; débordement horizontal jusqu'à 768 px |
| `/gestion-avis` | Admin | Modération des avis | — | 503 en local (secrets absents) ; Basic Auth sinon | Non auditée fonctionnellement |
| URL inexistante | 404 | — | « Retour à l'accueil » | **200** | Soft 404, `index, follow`, canonical `/404` |
| `/robots.txt`, `/sitemap.xml` | Technique | — | — | 200 | Sitemap de 13 URL, générées depuis l'hôte de la requête |
| `POST /api/contact`, `POST /api/reviews`, `GET /api/reviews/public`, `GET|PATCH /api/admin/reviews` | API | — | — | — | Voir §5.9 et §5.10 |

### 3.2 Structure de navigation

- **En-tête :** barre supérieure (téléphone, e-mail, « Disponibles 7j/7 et 24h/24 ») ; 8 liens (Accueil, Services, Secteurs, Notre méthode, Nos engagements, À propos, FAQ, Contact) ; bouton téléphone ; bouton « Demander un devis gratuit ».
- **Pied de page :** 6 services, 9 liens de navigation (dont Références, Devis, Nous localiser), coordonnées, mentions légales et confidentialité.
- **Mobile (860 px et moins) :** menu burger ; barre fixe « Appeler / Devis gratuit » (inopérante en pratique, voir C-02).
- **Orphelines de la navigation principale :** `/references`, `/devis` et `/nous-localiser`, accessibles seulement par le pied de page ou les CTA.

### 3.3 Offre, audiences et positionnement observés

- **Prestations (11) :** bureaux, commerces/ERP, industriel, vitres/façades (cordistes), après travaux, services spécialisés (salles blanches, décontamination, ventilation), piscines, extérieurs/voiries (dont déneigement), cheminées/conduits (ramonage), transport/citernes, remise en état après sinistre (dont « plages et espaces naturels »).
- **Audiences affichées :** entreprises, commerces/ERP, industrie, copropriétés/syndics, collectivités, santé. Le formulaire propose aussi « Particulier » et « Un promoteur », alors que le hero cible « Entreprises & industries ».
- **Positionnement exprimé :** « Une propreté irréprochable pour vos locaux professionnels ». Le message est générique et ne contient aucun élément différenciant vérifiable.
- **Technologies (certitude élevée, code source) :** Hono 4 (rendu serveur JSX), Vite 8, Cloudflare Pages avec Workers et D1 (SQLite), Resend (e-mail), Google Fonts (Poppins, Inter), Font Awesome 6.4.0 via jsDelivr, iframe Google Maps, JavaScript vanilla.

---

## 4. Analyse des trois parcours commerciaux

### Parcours A — Demande de devis

1. **Point d'entrée.** CTA « Demander un devis gratuit » dans l'en-tête desktop, le hero, la section zone, le CTA final, chaque carte service et secteur, et la barre mobile. **Visibilité : très bonne sur desktop.**
2. **Étapes.** Clic sur le CTA, puis `/devis`, puis un formulaire d'une seule page avec 10 champs, 11 cases de prestations, un message et le consentement, puis l'envoi AJAX et un message en ligne.
3. **Frictions (vérifiées).**
   - 7 champs obligatoires, dont **l'adresse postale complète** : nom, e-mail, téléphone, profil, adresse, code postal, ville, plus le consentement. C'est excessif pour une première prise de contact.
   - Les placeholders « Ex. 44000 » et « Ex. Nantes » contredisent la zone Île-de-France.
   - « Prestations souhaitées \* » est affiché comme obligatoire mais **n'est pas exigé**, ni côté client ni côté serveur (envoi accepté avec `services: []`).
   - Aucune validation de format : « abc » accepté comme téléphone, « ZZZ » comme code postal.
   - **Fréquence souhaitée perdue** (absente du payload : `public/static/app.js`, objet `payload`).
   - Erreurs signalées uniquement par la bulle native du navigateur : une erreur à la fois, sans message en ligne ni `aria-invalid`.
4. **Réassurance.** « Sans engagement », « Devis détaillés et tarifs clairs », la méthode en 4 étapes et le téléphone dans la colonne latérale (`/devis`).
5. **Action finale.** Message « Votre demande a bien été envoyée… », formulaire réinitialisé, focus renvoyé sur `<body>`. **Pas de page de remerciement**, donc pas de conversion mesurable ; pas d'accusé de réception par e-mail ; **pas de délai de réponse annoncé**.
6. **Risques d'abandon.** Longueur du formulaire sur mobile (environ 2 400 px de défilement, voir capture), adresse exigée trop tôt, absence de délai de réponse, absence de preuves.
7. **Risque business critique.** Le serveur répond `success: true` même si l'e-mail n'est pas envoyé (`emailReason: "no_api_key"` observé) et même si l'insertion D1 échoue. Aucune interface ne lit la table `contact_requests`.
8. **Améliorations.** Formulaire en 2 étapes (besoin, puis coordonnées) ; adresse remplacée par « Code postal / ville du site » ; envoi de la fréquence ; règles de validation réelles ; page `/devis/merci` ; accusé de réception ; délai de réponse annoncé `[À confirmer avec GAM CLEAN]` ; fiabilisation de la réception (C-01).

### Parcours B — Appel ou prise de contact

1. **Point d'entrée.** Numéro dans la barre supérieure, bouton de l'en-tête (desktop), sous les CTA du hero, CTA final, `/contact`, `/devis`, `/nous-localiser` et le pied de page. Tous utilisent `tel:+33751379455` (vérifié).
2. **Étapes.** Un clic, puis l'appel.
3. **Frictions.**
   - **Sur mobile, la barre « Appeler / Devis gratuit » est hors de l'écran** à cause du débordement (C-02).
   - Le bloc « Contact » du pied de page est hors champ à 360 et 390 px.
   - La flèche gauche du carrousel recouvre le texte du hero à 390 px (chevauchement vérifié).
   - Le format « +33 (0) 7 51 37 94 55 » est peu naturel pour un public français, qui lit « 07 51 37 94 55 ».
   - Le bouton `floating-call` est présent dans le DOM mais **jamais affiché** (`display:none` dans toutes les règles) : c'est du code mort.
4. **Réassurance.** « Disponibles 7j/7 et 24h/24 ». C'est une promesse forte, déclarée aussi dans le JSON-LD (ouverture 00:00 à 23:59 tous les jours) : **à confirmer** avec GAM CLEAN, car un appel sans réponse la nuit détruit la crédibilité.
5. **Action finale.** Appel ou e-mail `contact.gmaclean@gmail.com`.
6. **Risques d'abandon.** Adresse Gmail (perçue comme peu professionnelle en B2B) dont l'orthographe `gmaclean` diverge de « GAM CLEAN », ce qui fait craindre une faute de frappe. Concurrence entre trois actions (devis, contact, appel) avec deux formulaires quasi identiques.
7. **Améliorations.** Corriger le débordement ; numéro au format national ; adresse e-mail sur domaine propre `[À confirmer]` ; distinguer clairement « Question rapide » (formulaire court) et « Devis » ; afficher la disponibilité réelle.

### Parcours C — Présentation et crédibilisation

1. **Point d'entrée.** Accueil, « À propos », Secteurs, Méthode, Engagements, Références.
2. **Constats.**
   - **Aucune preuve vérifiable** : pas de réalisation, de photo avant/après, de nom de client, d'avis publié, de certification documentée, d'attestation d'assurance, de date de création, ni de dirigeant ou d'équipe.
   - Les 6 cartes services de l'accueil utilisent **la même image** (`floor-cleaning.jpg`), et les 3 images de hero sont réutilisées sur toutes les pages internes.
   - Les cartes « Engagements » sont répétées sur 4 pages (accueil, à propos, références, engagements) et la méthode sur 4 pages.
   - « Avis vérifiés — Ce que disent nos clients » affiche « Aucun avis publié pour le moment », ce qui est contre-productif.
   - L'encart « pleinement habilitée à exercer sous les codes NAF 81.21Z, 81.22Z et 81.29B, ce qui atteste… de la conformité réglementaire » est **inexact**. Le code APE/NAF est une nomenclature statistique attribuée par l'INSEE ; il ne vaut ni habilitation ni attestation de conformité, et une entreprise n'a qu'un seul code APE principal. Ce passage expose à un grief de pratique commerciale trompeuse et peut être relevé par un acheteur averti.
   - Les mentions légales publiques affichent « information à compléter ».
3. **Cohérence de marque.**
   - Le logo du site (`logo.png`, 287×184, monogramme « GC » seul) affiche en haut à droite un fragment d'étoile détouré imparfaitement, illisible à 56×36 px.
   - Le logo fourni (fond bleu nuit, « GAM CLEAN » en capitales, étoiles) est cohérent avec la palette du site (`--color-navy: #0b2545`, dégradé vert-turquoise-bleu), mais il n'existe **aucune version vectorielle** (SVG).
   - Le slug LinkedIn `gam-glean` diverge de la marque : à vérifier, le lien n'a pas pu être testé.
4. **Améliorations.** Voir §8 (contenus à fournir) ; retrait des allégations non prouvées ; avis masqués tant qu'il n'y en a pas ; page « À propos » incarnée.

---

## 5. Audit détaillé par domaine

> Format : **Constat factuel / Preuve / Problème / Impact / Priorité / Certitude / Recommandation / Critère de correction**. Les identifiants renvoient au registre (§6).

### 5.1 Design et identité visuelle

**D-01 — En-tête cassé entre 861 et environ 1100 px**
- **Constat :** à 900 px, la zone `.main-nav` mesure **364 px de haut** : les 8 liens s'empilent verticalement à côté du logo et des boutons. À 1024 px, elle mesure 183 px (2 lignes). À 1440 px, les liens tiennent aussi sur 2 lignes.
- **Preuve :** `captures/header-900.png`, `captures/header-1024.png` ; le menu burger n'apparaît qu'à 860 px et moins (`style.css`, `@media (max-width: 860px)`).
- **Problème :** 8 liens et 2 boutons ne tiennent pas sur une ligne ; aucun palier intermédiaire.
- **Impact :** le hero est repoussé sous la ligne de flottaison sur tablette paysage et petits portables ; l'impression de qualité s'effondre.
- **Priorité :** Haute · **Certitude :** Vérifié
- **Recommandation :** réduire la navigation à 5 ou 6 entrées (Services, Secteurs, À propos, FAQ, Contact, plus le CTA) en regroupant Méthode et Engagements sous À propos ; afficher le burger en dessous d'environ 1100 px ou à partir d'une mesure réelle.
- **Critère :** hauteur de l'en-tête au plus 90 px de 861 à 1440 px ; aucun lien sur 2 lignes.

**D-02 — Image unique répétée et visuels peu incarnés**
- **Constat :** `home.tsx` applique `images.floorCleaning` aux 6 cartes services. Les heroes 1, 2 et 3 sont recyclés sur les 12 pages internes.
- **Problème :** répétition visible ; aucune image identifiable comme une intervention réelle de GAM CLEAN (origine « plaquette commerciale » selon le README, non vérifiable).
- **Impact :** crédibilité ; banalisation de la marque.
- **Priorité :** Moyenne · **Certitude :** Vérifié (répétition) / Non vérifiable (origine des photos)
- **Recommandation :** une image distincte par service, idéalement réelle `[À fournir par GAM CLEAN]` ; à défaut, des pictogrammes cohérents plutôt qu'une photo répétée.
- **Critère :** aucune image dupliquée dans une même grille ; droits d'usage documentés.

**D-03 — Logo matriciel détouré imparfaitement**
- **Constat :** `logo.png` (287×184, 45 Ko) est affiché à 56×36 px dans l'en-tête et à 44×28 px dans le pied de page ; un fragment d'étoile apparaît en haut à droite.
- **Impact :** netteté et poids (Lighthouse : 39 Ko gaspillés) ; marque peu lisible.
- **Priorité :** Moyenne · **Certitude :** Vérifié
- **Recommandation :** vectoriser le logo (SVG) en version horizontale (monogramme et « GAM CLEAN »), avec variantes claire et sombre et favicon dédié.
- **Critère :** logo SVG de moins de 10 Ko, net à toute taille ; favicon 32×32 et 180×180 lisibles.

**Observations complémentaires (vérifiées) :**
- La palette (vert `#22a666`, turquoise `#12a3a0`, bleu `#1c6fd6`, marine `#0b2545`) et la typographie (Poppins pour les titres, Inter pour le texte) forment un ensemble cohérent et adapté à la propreté.
- Les boutons en dégradé avec rayon complet sont cohérents entre pages.
- La hiérarchie est lisible sur desktop. En revanche, le rythme est monotone : grilles de cartes à icône identiques d'une section à l'autre.

### 5.2 UX et navigation

**U-01 — Débordement horizontal sur mobile (toutes les pages)** : voir C-02 (§6) et la section mobile (§5.7).

**U-02 — Navigation surdimensionnée et pages clés hors menu**
- **Constat :** le menu compte 8 entrées, dont 3 à faible valeur de décision (Méthode, Engagements, FAQ), alors que Références et Devis n'y figurent pas.
- **Impact :** dilution de l'attention et mauvaise orientation vers la preuve sociale.
- **Priorité :** Moyenne · **Certitude :** Vérifié
- **Recommandation :** voir D-01. Ajouter « Réalisations » quand du contenu réel existe.
- **Critère :** 6 entrées au maximum ; chaque objectif commercial accessible en un clic.

**U-03 — Carrousel automatique sans pause**
- **Constat :** défilement toutes les 5,5 s. La pause n'existe qu'au survol de la souris, pas au focus ni par un bouton. Le défilement continue même avec `prefers-reduced-motion: reduce` (vérifié : diapositive 0 puis 1 après 6 s).
- **Problème :** le message principal n'évolue pas ; le carrousel n'apporte que du poids (3 images, environ 577 Ko) et du mouvement. Les flèches chevauchent le texte à 390 px.
- **Impact :** performance (LCP), accessibilité (2.2.2), lisibilité mobile.
- **Priorité :** Moyenne · **Certitude :** Vérifié
- **Recommandation :** remplacer par une image fixe optimisée ; sinon bouton pause, arrêt au focus et respect du mouvement réduit.
- **Critère :** aucun mouvement automatique avec mouvement réduit ; aucun chevauchement à 360 px.

**U-04 — Duplication des formulaires contact et devis**
- **Constat :** `/contact` réutilise `ContactForm` avec adresse, code postal et ville obligatoires.
- **Impact :** friction pour une simple question.
- **Priorité :** Moyenne · **Certitude :** Vérifié
- **Recommandation :** formulaire contact court (nom, e-mail ou téléphone, message, consentement).
- **Critère :** 4 champs obligatoires au maximum sur `/contact`.

### 5.3 Contenu et copywriting

| Écrit actuellement | Problème | Recommandation | Information à obtenir |
|---|---|---|---|
| H1 accueil : « Une propreté irréprochable pour vos locaux professionnels » | Générique, interchangeable avec n'importe quel concurrent, sans localisation | Exemple : « Entreprise de nettoyage professionnel à Bondy et en Île-de-France », plus une promesse différenciante réelle | Différenciateur réel `[À confirmer avec GAM CLEAN]` |
| « …partout en Bondy, Seine-Saint-Denis et toute l'Île-de-France » (hero, généré par `company.serviceArea`) | **Faute** (« en Bondy ») | « à Bondy, en Seine-Saint-Denis et dans toute l'Île-de-France » | — |
| « GAM CLEAN est pleinement habilitée… codes NAF… atteste… conformité réglementaire » (`/services`, `/qui-sommes-nous`) | Juridiquement inexact (voir §4-C) | Supprimer, ou remplacer par « Activité déclarée : code APE [code réel] » | Code APE réel (avis de situation INSEE) |
| « Personnel formé et qualifié, contrôles réguliers, garantie de résultat » ; « Respect des normes QHSE, assurances professionnelles à jour » ; « cordistes qualifiés » ; « réduction de l'empreinte carbone » | Allégations sans preuve ; « garantie de résultat » engage contractuellement | Ne publier que ce qui est documentable (attestation RC Pro, certificats CATEC/cordiste, labels produits) | Attestation d'assurance, qualifications, fiches produits `[À fournir]` |
| « Disponibles 7j/7 et 24h/24 » (barre supérieure, pied de page, contact, devis, FAQ, engagements, plus le JSON-LD) | Promesse opérationnelle forte | Afficher la disponibilité réelle (horaires plus astreinte si elle existe) | Horaires et astreinte réels |
| « Avis vérifiés — Ce que disent nos clients » puis « Aucun avis publié pour le moment » | Preuve sociale négative | Masquer la section tant qu'il n'y a aucun avis publié | Avis réels collectés |
| « Nous revenons vers vous rapidement », « dans les plus brefs délais » | Vague | Délai précis | Délai de réponse réel |
| 11 prestations, dont déneigement, citernes, bus, plages | Offre très large et peu crédible pour une structure qui « construit progressivement ses références » (`/references`) | Hiérarchiser : 3 ou 4 cœurs de métier mis en avant, le reste en « Autres prestations sur demande » | Prestations réellement réalisées et rentables |
| Kicker « Entreprises & industries » vs option « Particulier » | Cible incohérente | Trancher B2B seul ou B2B et particuliers | Politique commerciale |
| Méthode et engagements répétés sur 4 pages | Contenu dupliqué, pages minces (173 et 177 mots) | Fusionner Méthode et Engagements dans « À propos » ; garder un extrait sur l'accueil | — |

**Version 1 (pour mémoire, vérifié dans le code) :** `/references` y affichait 3 témoignages 5 étoiles anonymes (« Responsable de site, secteur tertiaire »…) présentés comme « Témoignages représentatifs ». Sans source, **ils ne doivent jamais être republiés**. La v3 les a retirés à juste titre.

**Objections non traitées :** prix ou fourchette, délai de démarrage, contrat (durée, résiliation), remplacement en cas d'absence d'un agent, encadrement du personnel, assurance, références.

### 5.4 Conversion

Voir §4. **Synthèse :**
- **CTA :** suffisants, voire excessifs (2 CTA de devis identiques visibles simultanément au-dessus de la ligne de flottaison sur l'accueil desktop : en-tête et hero).
- **Freins réels :** fiabilité de réception (C-01), barre mobile cassée (C-02), longueur du formulaire, absence de preuve, absence de délai de réponse.
- **Mesure :** aucun outil d'analytics ni de suivi de conversion. C'est cohérent avec la politique de confidentialité, mais aucune optimisation n'est pilotable.

### 5.5 SEO

**SEO technique (vérifié sur l'instance locale) :**

| Point | Constat | Statut |
|---|---|---|
| Codes de réponse | 200 sur les 13 pages publiques | OK |
| Page 404 | **Statut 200**, `robots: index, follow`, canonical `…/404` | **Défaut (S-01)** |
| Canonical / `og:url` / `og:image` | Codés en dur sur `https://c2de00ab-…vip.gensparksite.com` (`src/lib/seo.tsx`, `SITE_URL`) | **Défaut (S-02)** : sur la sandbox ou sur Vercel, chaque page déclare un autre domaine comme canonique |
| Sitemap | 13 URL générées depuis l'hôte de la requête ; sans `lastmod` ; `priority` et `changefreq` ignorés par Google | Incohérent avec le canonical (S-02) |
| robots.txt | `Allow: /`, `Disallow` des 2 pages privées, plus le sitemap | Correct. `/satisfaction-client` porte aussi `noindex`, mais un `Disallow` empêche Google de lire ce `noindex` ; l'impact est faible. |
| Rendu | Rendu serveur (Hono JSX) : contenu présent dans le HTML initial, sauf les avis (chargés en JS) | OK |
| Liens internes | Tous des `<a href>` explorables ; ancres `/services#id` valides | OK |
| HTTPS / contenu mixte | Non vérifiable en local ; aucune ressource `http://` dans le code | Probablement OK |
| Domaine sandbox | Probablement servi avec `index, follow` (meta codée en dur) | Risque d'indexation d'un domaine de démonstration (Probable) |

**SEO on-page :**
- **Titles** uniques, de 26 à 68 caractères. Faibles : « Nos références — GAM CLEAN » (26), « Nos engagements — GAM CLEAN » (27), « Mentions légales — GAM CLEAN » (28).
- **Meta descriptions** uniques ; celle de l'accueil fait 192 caractères (risque de troncature).
- **H1 :** un seul par page. Plusieurs sont non descriptifs : « Qui sommes-nous ? », « Nous localiser », « Foire aux questions », « Des engagements concrets, pas des promesses vagues ».
- **Hiérarchie :** sauts H1 vers H3 sur l'accueil (bandeau de réassurance), `/nous-localiser`, `/contact` et `/secteurs` (axe `heading-order`).
- **Pages par service : absentes.** Les 11 prestations sont regroupées sur `/services`, ce qui limite fortement le positionnement sur des requêtes comme « nettoyage de bureaux Bondy » ou « nettoyage après travaux Seine-Saint-Denis ». Le tableau `seoKeywords` de `data.ts` n'est **utilisé nulle part** (code mort).
- **Images :** 2 `<img>` par page (logos), avec alt pertinent. Toutes les autres images sont des `background-image` CSS, donc invisibles pour Google Images et sans alt possible.
- **Open Graph :** présent mais pointe vers le domaine Genspark ; pas de `twitter:image`.
- **Langue :** `lang="fr"` présent.

**Données structurées (vérifiées) :**
- `CleaningService` (sous-type valide de `LocalBusiness`) sans `streetAddress` ni `geo`. C'est cohérent avec le choix de ne pas publier l'adresse, mais cela affaiblit le signal local.
- `openingHoursSpecification` déclare 00:00 à 23:59 tous les jours : **à confirmer**.
- `priceRange: '€€'` est une valeur non fournie par GAM CLEAN : **à confirmer ou retirer**.
- `sameAs` pointe vers LinkedIn `gam-glean` (orthographe à vérifier).
- `FAQPage` sur `/faq` : syntaxe correcte. Google limite l'affichage enrichi des FAQ aux sites gouvernementaux et de santé faisant autorité depuis 2023 : le balisage reste valide mais n'apportera **probablement** pas de résultat enrichi.

**SEO local :**
- Nom, téléphone et ville sont cohérents sur toutes les pages (vérifié).
- Adresse absente (choix assumé, `/nous-localiser`).
- Zones : Bondy, Seine-Saint-Denis, Île-de-France, sans page locale.
- Fiche Google Business Profile : **non vérifiable**.

**Recommandations SEO :** voir S-01 à S-05 (§6). Ne créer **aucune** page locale par ville tant que GAM CLEAN n'a pas confirmé y intervenir réellement, avec un contenu propre à chaque ville. Aucun classement ne peut être garanti.

### 5.6 Performance

**Mesures de laboratoire (Lighthouse 12, localhost, throttling simulé, Font Awesome bloqué) :**

| Page / profil | Score perf. | FCP | LCP | TBT | CLS | Poids mesuré* |
|---|---|---|---|---|---|---|
| Accueil, mobile | 87 | 2,6 s | **3,3 s** | 0 ms | 0 | 830 Kio |
| Accueil, desktop | 99 | 0,6 s | 1,0 s | 0 ms | 0 | 830 Kio |
| Devis, mobile | 86 | 2,7 s | **3,3 s** | 0 ms | 0 | 334 Kio |
| Devis, desktop | 100 | 0,6 s | 0,6 s | 0 ms | 0 | 323 Kio |

\* Hors Font Awesome (environ 102 Ko de CSS et 258 Ko de polices, mesurés séparément avec Playwright). Le poids réel de l'accueil est donc d'environ 1,2 Mo.

- **Seuils de référence (web.dev, Core Web Vitals) :** LCP au plus 2,5 s, INP au plus 200 ms, CLS au plus 0,1, au 75e centile des données **terrain**. Ces seuils sont connus à la date de l'audit ; la page web.dev n'a pas pu être consultée depuis l'environnement, à revérifier. Le LCP mobile de laboratoire (3,3 s) dépasse le seuil de « bon », **à titre indicatif seulement**.
- **Données terrain (CrUX) et INP : non disponibles.**

**Causes vérifiées :**
1. **Ressources bloquantes** : Google Fonts (environ 885 ms estimés), Font Awesome CDN (environ 780 ms), `style.css`. Économie estimée par Lighthouse : 1 840 ms.
2. **Élément LCP** = `div.slide` avec `background-image` (`hero-1.jpg`, 195 Ko). Une image CSS est découverte tardivement, sans `preload` ni `fetchpriority`.
3. **Les 3 images du carrousel sont chargées d'emblée** (577 Ko) alors qu'une seule est visible.
4. **Aucun format moderne** (WebP/AVIF) : économie estimée de 398 Kio. Aucune image responsive (`srcset`) : le mobile charge les fichiers de 1248 à 1400 px.
5. **Font Awesome complet** (2 fichiers de polices et environ 102 Ko de CSS) pour une cinquantaine d'icônes ; 7 graisses Google Fonts chargées.
6. **Cache :** `Cache-Control: public, max-age=0, must-revalidate` observé sur les images en local. C'est probablement le comportement par défaut de Cloudflare Pages en production (Probable, à revérifier).
7. **Points positifs :** CLS de 0, TBT de 0, un seul script de 10 Ko chargé en fin de `body`, `font-display: swap`.

### 5.7 Mobile

| Contrôle | Constat | Certitude |
|---|---|---|
| Viewport | `width=device-width, initial-scale=1.0` présent | Vérifié |
| **Défilement horizontal** | **Largeur de document de 627 px à 320, 360 et 390 px** sur les 14 pages utilisant le pied de page commun. Cause : `.footer-grid { grid-template-columns: 1.4fr 1fr 1fr 1fr }` sans règle responsive. `/satisfaction-client` déborde jusqu'à 768 px (810 px). À 768 px, la barre mobile dépasse de 6 px. | Vérifié |
| **Barre fixe « Appeler / Devis gratuit »** | En émulation mobile, la zone d'affichage s'élargit à 627 px : la barre se retrouve à y = 1284 px pour une hauteur visible de 844 px, donc **hors écran** (`captures/devis-390-barre-mobile-absente.png`). | Vérifié en émulation Chromium ; à confirmer sur appareil réel (iOS Safari peut se comporter autrement) |
| Pied de page mobile | Colonne Contact hors champ ; colonnes de 80 à 110 px de large, avec des mots coupés sur 3 lignes | Vérifié (`captures/accueil-390-footer-debordement.png`) |
| Hero | Flèche « précédent » superposée au paragraphe à 390 px | Vérifié |
| Menu | S'ouvre correctement et affiche les CTA téléphone et devis ; `Échap` ne le ferme pas ; le libellé reste « Ouvrir le menu » une fois ouvert | Vérifié |
| Formulaire | `type="email"`, `type="tel"`, `type="number"` et `autocomplete` présents (claviers adaptés) ; environ 2 400 px de hauteur à 390 px | Vérifié |
| Cibles tactiles | Points du carrousel de 12×12 px (sous les 24×24 px requis) ; liens du pied de page de 20 px de haut | Vérifié |

### 5.8 Accessibilité (référence WCAG 2.2 AA)

Score Lighthouse : 86 (accueil), 96 (devis). **Un score automatique ne vaut pas conformité.** Les contrôles manuels ci-dessous complètent axe-core.

| ID | Critère WCAG | Constat (preuve) | Certitude |
|---|---|---|---|
| A-01 | **1.4.10 Redistribution** | Défilement horizontal à 320 px (`/contact` : 626 px) | Vérifié |
| A-02 | **1.4.3 Contraste** | Copyright et slogan du pied de page : `#22302c` sur `#0b2545`, **ratio 1,11:1**, donc pratiquement invisibles. Cause : la règle globale `p { color: var(--color-text) }` écrase `.footer-bottom-inner`. Liens « Voir la carte », « Voir les mentions légales complètes » : `#22a666` sur blanc ou `#f4f9f7`, ratios de 3,12 et 2,93 pour un texte de 13,6 px. | Vérifié (axe + capture) |
| A-03 | **1.4.1 Utilisation de la couleur** | Liens dans le texte (`/faq`, `/notre-methode`, `/services`, pages légales) distingués du texte uniquement par la couleur (1,14:1 entre lien et texte, sans soulignement) | Vérifié (axe) |
| A-04 | **2.5.8 Taille des cibles (minimum)** | Points du carrousel de 12×12 px | Vérifié (axe) |
| A-05 | **4.1.2 Nom, rôle et valeur** | FAQ : boutons sans `aria-expanded` ni `aria-controls`. Menu : libellé figé à « Ouvrir le menu » et `aria-controls="main-nav"` qui ne désigne pas le panneau complet. Carrousel : `role="tablist"` sans enfants `tab` (axe `aria-required-children`, critique). | Vérifié |
| A-06 | **2.2.2 Mettre en pause, arrêter, masquer** | Carrousel automatique sans contrôle de pause et ignorant `prefers-reduced-motion`. Les images sont décoratives, ce qui rend l'applicabilité du critère discutable. | Probable |
| A-07 | **3.3.1 / 3.3.3 Identification des erreurs, suggestions** | Erreurs signalées par la seule bulle native, une à la fois ; pas de message en ligne, pas d'`aria-invalid`, pas d'`aria-describedby`. Aucune suggestion pour un téléphone ou un code postal invalides (non contrôlés). | Vérifié |
| A-08 | **3.3.2 Étiquettes ou instructions** | « Prestations souhaitées \* » annoncé comme obligatoire mais non exigé | Vérifié |
| A-09 | **1.3.1 Information et relations** | Sauts de niveaux de titres (H1 vers H3) sur plusieurs pages | Vérifié (axe `heading-order`) |
| A-10 | **2.4.7 Visibilité du focus** | Liens et boutons : contour natif du navigateur (visible). Champs : `outline: none` remplacé par un halo vert à 15 % d'opacité et un changement de bordure, peu perceptible. | Probable (faible visibilité, pas une absence) |
| A-11 | Bonne pratique | Icônes Font Awesome `<i>` sans `aria-hidden="true"` ; le focus est perdu sur `<body>` après l'envoi (le message est toutefois annoncé via `role="status"`) | Vérifié |
| — | Points conformes | `lang="fr"` ; lien d'évitement fonctionnel ; landmarks `header`, `nav`, `main` et `footer` ; labels `for`/`id` ; `fieldset`/`legend` pour les prestations ; ordre de tabulation logique, sans piège clavier sur l'accueil ; animations d'apparition désactivées en mouvement réduit | Vérifié |

### 5.9 Technique

**T-01 — Réponse de succès inconditionnelle et demandes invisibles (critique)**
- **Constat :** dans `src/routes/api.tsx`, l'écriture en base (`dbSaved`) et l'envoi d'e-mail (`emailResult.sent`) n'influencent pas la réponse : `success: true` est toujours renvoyé. Test local : `{"success":true,…,"debug":{"dbSaved":true,"emailSent":false,"emailReason":"no_api_key"}}`. Aucune route ne lit `contact_requests`. Le README indique que l'expéditeur `onboarding@resend.dev` « n'autorise l'envoi que vers l'adresse email utilisée pour créer le compte Resend ».
- **Impact :** perte de prospects sans aucune alerte. C'est le risque business n°1.
- **Priorité :** Critique · **Certitude :** Vérifié (code et test local). La configuration Resend réelle de la sandbox est **non vérifiable**.
- **Recommandation :** renvoyer une erreur (5xx) avec message de repli « Appelez-nous » si **ni** la persistance **ni** la notification n'ont réussi ; domaine d'envoi vérifié ; alerte en cas d'échec ; vue d'administration ou export des demandes.
- **Critère :** test de bout en bout réussi (demande reçue sur la boîte réelle) ; échec simulé (clé invalide) correctement signalé ; demandes consultables.

**T-02 — Champ `frequency` non transmis**
- **Constat :** `public/static/app.js`, l'objet `payload` ne contient pas `frequency`. Test : « Hebdomadaire » sélectionné, absent de la requête. L'API, la migration 0004 et l'e-mail prévoient pourtant ce champ.
- **Priorité :** Haute · **Certitude :** Vérifié
- **Recommandation :** ajouter `frequency: formData.get('frequency') || ''`.
- **Critère :** valeur présente en base et dans l'e-mail.

**T-03 — Soft 404** : voir S-01.

**T-04 — Configuration de production incomplète**
- **Constat :** `wrangler.jsonc` contient `"database_id": "REPLACE_WITH_PRODUCTION_DATABASE_ID"` ; `SITE_URL` est codé en dur.
- **Impact :** déploiement non reproductible ; migration vers Vercel non directe, car D1 et Workers sont propres à Cloudflare.
- **Priorité :** Haute pour la refonte · **Certitude :** Vérifié

**Autres observations (vérifiées) :**
- Code mort : `floating-call`, `whyUs`, `seoKeywords`.
- Typage contourné : `as any` sur chaque rendu.
- Indentation incohérente dans `ContactForm.tsx`.
- Aucune erreur console sur les pages testées (hors ressources externes bloquées par l'environnement).
- Le code est lisible et commenté ; les données sont centralisées.
- Limite : sans dépôt git ni historique, la qualité de maintenance dans le temps ne peut pas être évaluée.

### 5.10 Sécurité défensive et confidentialité observable

| ID | Constat | Analyse d'impact (contexte) | Priorité | Certitude |
|---|---|---|---|---|
| SEC-01 | `/api/contact` renvoie `debug: { dbSaved, emailSent, emailReason }`, où `emailReason` peut contenir jusqu'à 200 caractères du corps d'erreur Resend | Divulgation d'informations de configuration (OWASP : gestion des erreurs). Exploitabilité faible, mais aide à la reconnaissance. | Haute | Vérifié |
| SEC-02 | Aucun honeypot, CAPTCHA ni limitation de débit ; aucune limite de longueur sur `/api/contact` (message de 200 000 caractères et nom de 5 000 caractères acceptés en local) | Spam, saturation de D1 et de la boîte mail, coût Resend | Haute | Vérifié |
| SEC-03 | Admin protégé par HTTP Basic Auth (secrets côté serveur), sans limitation des tentatives | Acceptable sous HTTPS. Le risque de force brute dépend de la robustesse du mot de passe et des protections de la plateforme (non vérifiable). | Moyenne | Vérifié (code) |
| SEC-04 | Un avis peut passer au statut `published` sans `consent_publish = 1` : aucun contrôle dans le `PATCH`, et `/api/reviews/public` ne filtre pas sur le consentement | Risque RGPD (publication du nom sans accord) | Haute | Vérifié (code) |
| SEC-05 | L'admin peut **modifier le texte d'un avis** ; la page publique le présente comme « Avis authentiques… validés par nos équipes » | Incompatible avec l'obligation d'information loyale sur les avis (Code de la consommation, art. L111-7-2). Risque de pratique trompeuse. | Haute | Vérifié (code) |
| SEC-06 | En-têtes de sécurité (CSP, HSTS, `frame-ancestors`/X-Frame-Options, Referrer-Policy, Permissions-Policy) **non définis par l'application** (aucun `_headers`, aucun middleware). En local, seuls `x-content-type-options: nosniff` et `referrer-policy` apparaissent, ajoutés par wrangler. | La production n'a pas pu être observée. À définir explicitement (`vercel.json` ou middleware). | Moyenne | Vérifié (code) / Non vérifiable (production) |
| SEC-07 | Font Awesome chargé depuis jsDelivr **sans SRI** ; iframe Google Maps ; Google Fonts | Dépendance tierce (chaîne d'approvisionnement). **Confidentialité :** Google Fonts transmet l'IP des visiteurs à Google (jurisprudence allemande LG München, 2022). L'iframe Maps dépose probablement des cookies Google sans consentement, ce qui contredit « Aucun cookie… tiers ». | Moyenne | Vérifié (chargements) / Probable (cookies Maps) |
| SEC-08 | `/satisfaction-client` est accessible à tous, sans jeton | N'importe qui peut soumettre de faux avis (modérés, donc impact limité) | Faible | Vérifié |
| SEC-09 | Points positifs : SQL paramétré ; noms de colonnes du `PATCH` sur liste blanche ; `escapeHtml` dans l'e-mail ; échappement à l'affichage des avis ; secrets hors du code ; `.dev.vars` ignoré par git ; aucun secret trouvé dans le code client | — | — | Vérifié |
| SEC-10 | Politique de confidentialité : durée de conservation non chiffrée ; CNIL « à compléter » ; base légale « consentement » alors que des mesures précontractuelles suffisent ; aucune vraie purge (aucun mécanisme de suppression de `contact_requests`) | Non-conformité RGPD (art. 5.1.e, 13) | Moyenne | Vérifié |

---

## 6. Registre priorisé des constats

Échelle : **Critique** (perte de business ou risque juridique immédiat), **Haute**, **Moyenne**, **Faible**. Effort indicatif : faible / moyen / élevé.

| ID | Domaine | Page/URL | Constat factuel et preuve | Problème | Impact | Priorité | Effort | Certitude | Recommandation | Critère d'acceptation |
|---|---|---|---|---|---|---|---|---|---|---|
| C-01 | Technique / Conversion | `POST /api/contact` | `success:true` renvoyé même si `emailSent:false` ou `dbSaved:false` ; pas d'interface pour `contact_requests` ; Resend en mode bac à sable | Perte silencieuse de demandes | Business : prospects perdus | **Critique** | Moyen | Vérifié (code et test) | Succès seulement si persistance **ou** notification réussie ; domaine vérifié ; alerte ; consultation des demandes | Demande test reçue sur la boîte réelle ; échec simulé signalé au visiteur avec repli téléphone |
| C-02 | Mobile / A11y | Toutes (pied de page commun) | Largeur de document de 627 px à 320, 360 et 390 px ; barre « Appeler/Devis » à y = 1284 px pour un écran de 844 px | Débordement ; CTA mobile invisible | Appels et devis mobiles ; WCAG 1.4.10 | **Critique** | Faible | Vérifié (émulation) | Pied de page sur 1 colonne sous 640 px et 2 colonnes sous 980 px ; `min-width:0` sur les colonnes ; retest | `scrollWidth == clientWidth` à 320, 360, 390 et 768 px ; barre visible en bas d'écran |
| C-03 | Juridique / Confiance | `/mentions-legales` | 3 encarts « information à compléter » (adresse, directeur de publication, hébergeur) | Mentions LCEN incomplètes publiées | Juridique ; crédibilité | **Critique** | Faible (avec les données) | Vérifié | Compléter avec des informations réelles avant mise en ligne en production | Aucun « à compléter » ; mentions LCEN complètes |
| H-01 | Conversion / Technique | `/devis` | `frequency` absent du payload (`app.js`) | Donnée de qualification perdue | Devis moins qualifiés | Haute | Faible | Vérifié | Ajouter le champ au payload | Valeur présente en base et dans l'e-mail |
| H-02 | UI | Toutes, 861 à environ 1100 px | `.main-nav` de 364 px de haut à 900 px | En-tête cassé | Tablette paysage et petits portables | Haute | Faible à moyen | Vérifié | Navigation réduite et burger plus tôt | En-tête au plus 90 px, de 861 à 1440 px |
| H-03 | Contenu / Juridique | `/services`, `/qui-sommes-nous` | « pleinement habilitée… codes NAF… atteste… conformité » | Allégation inexacte | Pratique trompeuse ; crédibilité | Haute | Faible | Vérifié | Supprimer ou reformuler factuellement (code APE réel) | Plus aucune mention d'« habilitation » liée au NAF |
| H-04 | Contenu / Confiance | Accueil, engagements, FAQ, JSON-LD | QHSE, assurances, cordistes, « garantie de résultat », 24h/24 7j/7, empreinte carbone, `priceRange` | Allégations non étayées | Crédibilité ; risque juridique | Haute | Moyen | Vérifié (présence) / Non vérifiable (véracité) | Valider chaque allégation avec GAM CLEAN ; retirer sinon | Chaque allégation adossée à une preuve archivée |
| H-05 | Confiance | `/references` | « Avis vérifiés » puis « Aucun avis publié pour le moment » | Preuve sociale négative | Crédibilité | Haute | Faible | Vérifié | Masquer la section si 0 avis | Section absente tant qu'il n'y a aucun avis publié |
| H-06 | SEO | Toutes | Canonical, `og:url` et `og:image` codés en dur sur `vip.gensparksite.com` ; sitemap sur l'hôte courant | Canonical cross-domain | Indexation erronée ; migration | Haute | Faible | Vérifié | `SITE_URL` en variable d'environnement = domaine de production | Canonical = URL servie sur le domaine de production |
| H-07 | SEO / Technique | URL inexistante | Statut 200 + `index, follow` | Soft 404 | Indexation de pages vides | Haute | Faible | Vérifié | `c.status(404)` + `noindex` | Réponse HTTP 404 |
| H-08 | Sécurité | `/api/contact` | Champ `debug` dans la réponse | Divulgation d'informations | Reconnaissance | Haute | Faible | Vérifié | Supprimer `debug` (logs serveur uniquement) | Réponse sans `debug` |
| H-09 | Sécurité | `/api/contact`, `/api/reviews` | Pas d'anti-spam ni de limites (message de 200 000 caractères accepté) | Spam, abus | Exploitation, coûts | Haute | Moyen | Vérifié | Honeypot, longueur maximale par champ, limitation de débit (ou Turnstile) | Message de plus de 5 000 caractères rejeté (400) ; honeypot rempli rejeté |
| H-10 | Juridique / RGPD | Admin avis | Publication possible sans consentement ; texte d'avis modifiable | Non-conformité ; avis non authentiques | Juridique | Haute | Faible | Vérifié (code) | Bloquer `published` si `consent_publish = 0` ; interdire l'édition du texte (ou la signaler) ; filtrer l'API publique | Tentative de publication sans consentement refusée |
| H-11 | A11y | Pied de page (toutes) | Copyright et slogan à 1,11:1 | Texte invisible | WCAG 1.4.3 | Haute | Faible | Vérifié | Couleur explicite (blanc à 70 % ou plus) sur `.footer-bottom-inner p` | Ratio d'au moins 4,5:1 |
| H-12 | Conversion | `/devis`, `/contact` | 7 champs obligatoires dont l'adresse ; contact = devis | Friction | Taux de conversion | Haute | Moyen | Vérifié | Formulaire devis en 2 étapes ; contact court | Contact : 4 champs requis au plus ; devis : adresse optionnelle |
| H-13 | Performance | `/` | LCP labo mobile de 3,3 s ; 3 images de hero chargées ; JPEG seulement ; aucun `srcset` | LCP au-dessus du seuil | SEO, abandon | Haute | Moyen | Vérifié (labo) | Image hero unique en `<img>` avec `fetchpriority="high"`, AVIF/WebP, `srcset` ; suppression du carrousel | LCP labo mobile au plus 2,5 s ; CrUX à suivre après mise en production |
| M-01 | A11y | FAQ, menu, carrousel | `aria-expanded` absent ; libellé figé ; `tablist` invalide | Rôles et états non exposés | WCAG 4.1.2 | Moyenne | Faible | Vérifié | `aria-expanded` et `aria-controls` dynamiques ; retirer `role="tablist"` | 0 violation axe ; test au lecteur d'écran |
| M-02 | A11y | Toutes | Liens dans le texte non soulignés (1,14:1) ; liens verts à 2,93 et 3,12:1 | Contraste et couleur | WCAG 1.4.1, 1.4.3 | Moyenne | Faible | Vérifié | Soulignement ; vert foncé `#157a4b` pour le texte | 0 violation `link-in-text-block` et `color-contrast` |
| M-03 | A11y / UX | `/devis`, `/contact` | Erreurs par bulle native seulement ; pas de validation de format ; prestations « \* » non exigées | Erreurs peu accessibles | WCAG 3.3.1, 3.3.2, 3.3.3 | Moyenne | Moyen | Vérifié | Messages en ligne, `aria-invalid`, `aria-describedby`, résumé d'erreurs ; règles téléphone/CP ; cohérence de l'astérisque | Chaque erreur annoncée et associée à son champ |
| M-04 | A11y / UX | `/` | Carrousel automatique sans pause, ignorant le mouvement réduit ; flèche sur le texte à 390 px ; points de 12 px | Mouvement non contrôlable | WCAG 2.2.2, 2.5.8 | Moyenne | Faible | Vérifié / Probable (2.2.2) | Image fixe, ou pause et respect du mouvement réduit | Aucun mouvement automatique en mouvement réduit |
| M-05 | SEO | `/services` | 11 services sur une seule URL ; `seoKeywords` inutilisé | Pas de pages ciblées | Visibilité locale | Moyenne | Élevé (contenu) | Vérifié | Pages dédiées pour les 3 ou 4 services cœur, avec contenu réel | Une URL, un H1 et un title uniques par service cœur |
| M-06 | Contenu | Accueil (hero) | « partout en Bondy » | Faute | Crédibilité | Moyenne | Faible | Vérifié | « à Bondy, en Seine-Saint-Denis et dans toute l'Île-de-France » | Texte corrigé |
| M-07 | Contenu / SEO | Méthode, Engagements, À propos, Références | Blocs répétés sur 4 pages ; pages de 173 et 177 mots | Contenu dupliqué et mince | SEO, lassitude | Moyenne | Moyen | Vérifié | Fusionner dans « À propos » | Aucun bloc identique sur plus de 2 pages |
| M-08 | Confiance | Toutes | E-mail `contact.gmaclean@gmail.com` (orthographe différente de la marque) ; LinkedIn `gam-glean` | Incohérence de marque | Crédibilité, risque de coquille | Moyenne | Faible | Vérifié (présence) / Non vérifiable (exactitude) | Confirmer les adresses ; e-mail sur domaine propre | Coordonnées confirmées par écrit par GAM CLEAN |
| M-09 | Sécurité | Toutes | Pas d'en-têtes CSP, HSTS ni `frame-ancestors` définis par l'application | Durcissement absent | Défense en profondeur | Moyenne | Faible | Vérifié (code) | En-têtes dans `vercel.json` (OWASP Secure Headers) | En-têtes présents en production |
| M-10 | Confidentialité | Accueil, `/nous-localiser` | iframe Google Maps et Google Fonts sans consentement ; politique affirmant « aucun cookie tiers » | Incohérence RGPD | Juridique | Moyenne | Faible | Probable | Polices auto-hébergées ; carte en façade cliquable (chargement au clic) | Aucune requête vers Google avant interaction |
| M-11 | Confidentialité | `/politique-de-confidentialite` | Durée de conservation non chiffrée ; aucun mécanisme de purge | Non-conformité RGPD | Juridique | Moyenne | Faible | Vérifié | Durée chiffrée `[À valider]` ; purge planifiée | Politique et implémentation alignées |
| M-12 | UX | Navigation | 8 entrées ; Devis et Références hors menu | Navigation diluée | Orientation | Moyenne | Faible | Vérifié | 5 ou 6 entrées | — |
| M-13 | Brand | En-tête, pied de page | `logo.png` matriciel avec artefact d'étoile ; pas de SVG | Netteté, poids | Image de marque | Moyenne | Moyen | Vérifié | Vectoriser | Logo SVG net, de moins de 10 Ko |
| F-01 | Performance | Toutes | Font Awesome complet (environ 360 Ko) ; 7 graisses de police | Surpoids | Performance | Faible | Moyen | Vérifié | Icônes SVG inline ; 3 ou 4 graisses auto-hébergées | Polices et icônes de moins de 100 Ko |
| F-02 | SEO | Toutes | Titles courts (26 à 28 caractères) ; H1 non descriptifs ; description de l'accueil à 192 caractères | Optimisation on-page | Visibilité | Faible | Faible | Vérifié | Réécrire titles et H1 | — |
| F-03 | Technique | Code | `floating-call`, `whyUs`, `seoKeywords` morts ; `as any` | Dette | Maintenabilité | Faible | Faible | Vérifié | Nettoyer lors de la refonte | — |
| F-04 | Sécurité | `/satisfaction-client` | Accès sans jeton ; débordement jusqu'à 768 px | Abus mineur ; UX | — | Faible | Faible | Vérifié | Lien à jeton unique par client | — |
| F-05 | SEO | robots.txt | `Disallow` et `noindex` combinés sur `/satisfaction-client` | Le `noindex` ne peut pas être lu | Faible | Faible | Faible | Vérifié | Garder `noindex` et retirer le `Disallow` | — |

---

## 7. Quick wins et améliorations structurantes

**Corrections rapides à fort impact (effort faible)**
1. Grille du pied de page responsive (C-02).
2. `frequency` dans le payload (H-01).
3. Couleur du copyright et du slogan (H-11).
4. Masquer la section avis vide (H-05).
5. Supprimer `debug` (H-08).
6. Vrai statut 404 (H-07).
7. Corriger « en Bondy » (M-06).
8. Supprimer l'encart NAF « habilitée » (H-03).
9. Soulignement des liens dans le texte (M-02).

**Corrections techniques nécessaires**
- Fiabilisation de la réception des demandes (C-01).
- `SITE_URL` configurable (H-06).
- Anti-spam et limites (H-09).
- Garde-fous sur le consentement et l'édition des avis (H-10).
- En-têtes de sécurité (M-09).
- États ARIA (M-01).

**Améliorations de contenu**
- Valider ou retirer les allégations (H-04).
- Compléter les mentions légales (C-03).
- Coordonnées sur domaine propre (M-08).
- Fusionner Méthode, Engagements et À propos (M-07).
- Délai de réponse réel.

**Améliorations de conversion**
- Formulaire de devis en 2 étapes et formulaire contact court (H-12).
- Page de remerciement et accusé de réception.
- Validation accessible (M-03).
- Hero sans carrousel avec CTA devis et appel côte à côte.

**Changements structurels pour la refonte**
- Nouvelle arborescence (§8).
- Pages par service cœur.
- Stack compatible Vercel.
- Images optimisées et assets auto-hébergés.
- Logo vectoriel.

---

## 8. Recommandations pour la future refonte

**À conserver**
- Le modèle de données centralisé (`data.ts`).
- La palette et le couple Poppins/Inter.
- La structure en sections de l'accueil (problème, services, secteurs, méthode, zone, FAQ, CTA).
- Le JSON-LD `CleaningService` (une fois corrigé).
- Le principe de modération des avis.
- La FAQ.
- La prudence rédactionnelle de la v3.

**À supprimer**
- Le carrousel.
- L'encart NAF « habilitée ».
- Les blocs dupliqués.
- La section avis vide.
- `floating-call` et les données mortes.
- Font Awesome CDN.
- Le champ `debug`.
- Toute allégation non prouvée.

**À repenser**
- La navigation : 5 ou 6 entrées.
- Les formulaires : devis en 2 étapes, contact court.
- La hiérarchie de l'offre : services cœur et « autres prestations ».
- La page « À propos » : incarnée.
- Le pied de page : responsive.
- La gestion des demandes : fiabilité et consultation.

**Arborescence à étudier** (à valider avec GAM CLEAN) :
- `/`
- `/services` avec `/services/[service-cœur]` × 3 ou 4
- `/secteurs`
- `/a-propos` (méthode et engagements intégrés)
- `/realisations` (seulement si du contenu réel existe)
- `/faq`
- `/devis` et `/devis/merci`
- `/contact`
- `/mentions-legales`
- `/politique-de-confidentialite`

**Informations à demander à GAM CLEAN**

| Catégorie | Éléments |
|---|---|
| Légal | Forme juridique, capital, adresse du siège, RCS, nom du directeur de publication, code APE réel, hébergeur choisi |
| Contact | E-mail correct, ou nom de domaine à acheter ; numéro (fixe ou mobile) ; horaires réels ; existence d'une astreinte |
| Offre | Services réellement réalisés et prioritaires ; cibles (B2B seul ou avec particuliers) ; communes réellement couvertes ; délai de réponse et de démarrage ; fourchettes ou politique tarifaire |
| Preuves | Attestation RC Pro ; qualifications (cordistes, habilitations) ; produits utilisés (labels) ; clients autorisant la citation ; photos réelles d'interventions et d'équipe (avec droits) ; avis réels |
| Entreprise | Date de création ; fondateur ou dirigeant (nom, parcours, photo) ; taille de l'équipe ; différenciateur réel |
| Marque | Logo source (vectoriel ou haute définition) ; règles d'usage |
| Réseaux | URL LinkedIn exacte ; fiche Google Business Profile |

**Fonctionnalités utiles**
- Formulaire de devis en plusieurs étapes, avec dépôt de photos optionnel.
- Bouton d'appel persistant sur mobile.
- Accusé de réception par e-mail.
- Tableau de suivi des demandes.
- Carte chargée au clic.
- Mesure d'audience respectueuse de la vie privée (exemptée de consentement selon les conditions CNIL), à valider.

**Exigences SEO**
- Canonical et sitemap basés sur le domaine de production.
- Un H1 et un title descriptifs par page.
- Vrai 404.
- Images de contenu en `<img>` avec alt.
- JSON-LD exact (aucune donnée non confirmée).
- Breadcrumb en JSON-LD (`BreadcrumbList`).
- Maillage services ↔ secteurs.
- `noindex` sur tout domaine de préproduction.

**Exigences d'accessibilité :** WCAG 2.2 AA en objectif : 0 violation axe ; tests clavier et lecteur d'écran (NVDA ou VoiceOver) ; reflow à 320 px ; contrastes d'au moins 4,5:1 ; cibles d'au moins 24 px ; erreurs de formulaire accessibles.

**Exigences de performance :** LCP labo mobile au plus 2,5 s ; images en AVIF/WebP avec `srcset` ; polices auto-hébergées (au plus 4 fichiers) ; icônes SVG ; pas de CSS ni de JS bloquant inutile ; cache long sur les assets versionnés ; suivi CrUX une fois le trafic suffisant.

**Exigences de sécurité :** en-têtes CSP, HSTS, `frame-ancestors`, Referrer-Policy et Permissions-Policy ; anti-spam (honeypot, Turnstile ou équivalent) ; limitation de débit ; validation et limites côté serveur ; aucune donnée de débogage exposée ; secrets en variables d'environnement Vercel ; principe du moindre privilège pour l'admin.

**Migration vers Vercel (éléments nécessaires)**
- La stack actuelle (Hono sur Cloudflare Pages avec D1 et `serveStatic` de `hono/cloudflare-workers`) **n'est pas portable telle quelle**. D1 n'existe pas sur Vercel.
- Options à arbitrer lors de la refonte :
  - (a) site statique ou SSG, avec envoi des formulaires vers une fonction serverless et un service d'e-mail transactionnel, sans base de données ;
  - (b) ajout d'une base gérée (Postgres ou équivalent) si l'historique des demandes et des avis est requis.
- Variables : `SITE_URL`, clé d'e-mail, adresse de notification, identifiants admin.
- Domaine propre avec enregistrements SPF, DKIM et DMARC pour l'envoi d'e-mails.

**Redirections et précautions**
- L'URL sandbox actuelle est probablement non indexée : aucune redirection n'est nécessaire depuis elle (Probable).
- Si le domaine `vip.gensparksite.com` a été diffusé ou indexé, prévoir des 301 vers le domaine final, si la plateforme le permet (non vérifiable).
- Conserver les slugs actuels (`/services`, `/devis`, `/contact`, `/faq`, `/mentions-legales`…) ou poser des 301 en cas de renommage (exemple : `/qui-sommes-nous` vers `/a-propos`).

---

## 9. Feuille de route logique (ordre et dépendances, sans calendrier)

1. **Blocages et risques critiques**
   - C-01 (réception des demandes) : prérequis à toute campagne d'acquisition.
   - C-02 (débordement mobile).
   - C-03 (mentions légales) : **dépend** des informations légales de GAM CLEAN.
2. **Quick wins** : H-01, H-05, H-07, H-08, H-11, M-06, H-03. Aucune dépendance externe.
3. **Contenu et conversion** : collecte des informations (§8), puis validation des allégations (H-04), coordonnées (M-08), formulaires (H-12, M-03), contenus fusionnés (M-07). **Dépend** des réponses de GAM CLEAN.
4. **SEO et accessibilité** : H-06 (**dépend** du nom de domaine), H-07, M-01, M-02, M-04, F-02. Pages par service (M-05), après validation de l'offre cœur.
5. **Performance et qualité technique** : H-13, F-01, M-13 (logo, **dépend** du fichier source), F-03, H-09, H-10, M-09 à M-11.
6. **Décisions structurantes pour la refonte** : choix de la stack Vercel (avec ou sans base), arborescence, outil de mesure, nom de domaine. **Ces décisions conditionnent les étapes 4 et 5 si la refonte est engagée immédiatement.** Dans ce cas, ne corriger dans le site actuel que les étapes 1 et 2.

**Arbitrage recommandé.** Si la refonte démarre à court terme, investir uniquement dans les étapes 1 et 2 sur le site actuel. Toutes les autres corrections doivent être intégrées **directement** dans la refonte, plutôt que de payer deux fois le même travail.

---

## 10. Limites et informations à obtenir

**Non vérifié**
- Le site hébergé à l'URL sandbox : quelle version (v1, v2 ou v3) y était servie, ses en-têtes HTTP, son TLS, son cache, ses cookies, sa configuration Resend et D1.
- Le comportement réel de la barre mobile sur iOS Safari et Android Chrome physiques.
- Les cookies déposés par l'iframe Google Maps.
- L'exactitude des coordonnées, du SIRET (clé de Luhn du SIRET et clé TVA FR48 calculées : **cohérentes entre elles**, mais l'existence au registre n'a pas pu être vérifiée), de LinkedIn et des allégations.
- L'interface `/gestion-avis` (secrets absents en local).

**Accès qui permettraient un audit complémentaire**
- Accès réseau à l'URL de production ou de préproduction : en-têtes, TLS, PageSpeed Insights.
- Dépôt git avec historique.
- Accès au compte Resend et à la base D1.
- Fiche Google Business Profile.

**Informations commerciales manquantes** : voir le tableau du §8.

**Mesures à collecter après la mise en production (aucune valeur présumée ici)**
- Search Console : couverture d'index, requêtes, clics, CTR, Core Web Vitals (terrain).
- Outil d'audience : sessions, sources, taux de conversion devis et appels (clics `tel:`), abandons de formulaire par étape.
- CrUX ou PageSpeed Insights terrain (LCP, INP, CLS) dès que le volume le permet.
- Nombre de demandes reçues comparé au nombre de demandes stockées (contrôle de C-01).

**Références utilisées**
- Google Search Central (canonicalisation, soft 404, robots et `noindex`, données structurées FAQ).
- web.dev (Core Web Vitals et seuils).
- W3C WCAG 2.2 (critères cités).
- Schema.org (`CleaningService`, `LocalBusiness`, `FAQPage`).
- OWASP (Secure Headers Project, gestion des erreurs).
- MDN (`fetchpriority`, `srcset`).
- Cadre juridique français : LCEN art. 6 III ; Code de la consommation art. L111-7-2 (avis en ligne) ; RGPD art. 5 et 13.

Ces sources n'ont pas pu être reconsultées en ligne pendant l'audit (accès réseau restreint) : les références sont citées d'après l'état des connaissances à la date de l'audit et **doivent être revérifiées** avant tout usage contractuel.

---

### Annexes — Captures (instance locale v3)

- `captures/accueil-1440-hero.png` : accueil desktop au-dessus de la ligne de flottaison (navigation sur 2 lignes).
- `captures/accueil-390-hero.png` : accueil mobile (flèche du carrousel sur le texte).
- `captures/accueil-390-footer-debordement.png` : pied de page à 390 px rendu sur 627 px (colonne Contact hors champ, copyright invisible).
- `captures/header-900.png`, `captures/header-1024.png` : en-tête cassé.
- `captures/menu-mobile-390.png` : menu mobile ouvert.
- `captures/devis-390-formulaire.png` : longueur du formulaire de devis mobile.
- `captures/devis-390-barre-mobile-absente.png` : barre « Appeler / Devis » absente de l'écran en émulation mobile.
