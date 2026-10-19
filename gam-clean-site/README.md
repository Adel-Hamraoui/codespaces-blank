# Site GAM CLEAN — site vitrine et back-office

Site de GAM CLEAN, entreprise de nettoyage professionnel basée à Bondy (93), avec un back-office protégé pour suivre les demandes, publier les avis clients et modifier les contenus.

- **Stack :** Next.js 16 (App Router, Cache Components), React 19, TypeScript, CSS Modules, PostgreSQL (Supabase) via `postgres.js`. Icônes : `lucide-react`.
- **Architecture :** trois couches séparées dans une même application — `frontend/` (interface), `backend/` (données, sécurité, e-mails), `shared/` (types et validation communs) — assemblées par `app/` (routes). La séparation est vérifiée automatiquement (`npm run check:architecture`). Détails : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- **Rendu :** pages publiques **statiques**, régénérées automatiquement après chaque modification faite dans le back-office. Back-office rendu à la demande.
- **Hébergement visé :** Vercel (site) + Supabase (base de données).

---

## Sommaire

1. [Installer le projet](#1-installer-le-projet)
2. [Créer la base de données (Supabase)](#2-créer-la-base-de-données-supabase)
3. [Lancer le site en local](#3-lancer-le-site-en-local)
4. [Le back-office](#4-le-back-office)
5. [Modifier les informations GAM CLEAN](#5-modifier-les-informations-gam-clean)
6. [Remplacer les photos](#6-remplacer-les-photos)
7. [Configurer les e-mails des demandes](#7-configurer-les-e-mails-des-demandes)
8. [Variables d'environnement](#8-variables-denvironnement)
9. [Créer le dépôt GitHub](#9-créer-le-dépôt-github)
10. [Connecter le dépôt à Vercel et déployer](#10-connecter-le-dépôt-à-vercel-et-déployer)
11. [Connecter un nom de domaine](#11-connecter-un-nom-de-domaine)
12. [Tests et contrôles qualité](#12-tests-et-contrôles-qualité)
13. [Annexes : structure, sécurité, mesure d'audience, redirections, dépannage, check-list](#annexes)

---

## 1. Installer le projet

Prérequis : **Node.js 22.18 ou plus récent** (`node -v`) et npm.

```bash
cd gam-clean-site
npm install
```

## 2. Créer la base de données (Supabase)

La base stocke les demandes de devis et de contact (avec statut, notes et historique), les avis clients, les contenus éditables et les comptes du back-office. Le schéma, ses optimisations et les mesures de performance sont décrits dans [`docs/BASE-DE-DONNEES.md`](docs/BASE-DE-DONNEES.md).

1. Créez un projet sur [supabase.com](https://supabase.com). Choisissez une **région située dans l'Union européenne** (données personnelles de prospects : RGPD) et notez le mot de passe de la base.
2. Récupérez les chaînes de connexion depuis le bouton **Connect** du tableau de bord Supabase (les intitulés peuvent évoluer) :
   - **Transaction pooler** (port `6543`) → variable `DATABASE_URL`, utilisée par le site sur Vercel ;
   - **Session pooler** ou connexion directe → variable `DATABASE_URL_MIGRATIONS`, utilisée pour installer et faire évoluer le schéma.

   Encodez les caractères spéciaux du mot de passe dans l'URL (`@` → `%40`, `#` → `%23`…).
3. Depuis votre poste, avec ces variables dans `.env.local` :

```bash
npm run db:migrate       # crée le schéma « gam » (tables, index, triggers, droits)
npm run db:seed          # contenu initial du site (prestations, FAQ, secteurs, coordonnées)
npm run admin:create -- --email prenom@exemple.fr --name "Prénom Nom"
```

La dernière commande crée le **premier compte (propriétaire)** et affiche **une seule fois** un mot de passe provisoire, à changer à la première connexion.

Points importants :

- Les données sont dans un schéma `gam` **non exposé** par l'API REST automatique de Supabase. N'ajoutez pas `gam` aux schémas exposés de l'API : le site accède à la base uniquement côté serveur.
- `db:seed` ne crée que ce qui manque : relancé, il **n'écrase jamais** une modification faite dans le back-office.
- `db:migrate` refuse de continuer si un fichier de migration déjà appliqué a été modifié : pour faire évoluer le schéma, ajoutez un nouveau fichier `backend/db/migrations/NNNN_description.sql`.
- Pour aller plus loin en sécurité, le site peut se connecter avec un rôle limité aux seules opérations sur les données (voir [`docs/BASE-DE-DONNEES.md`](docs/BASE-DE-DONNEES.md#rôle-de-connexion-à-privilèges-minimaux)).

**Sans base de données** (variable `DATABASE_URL` absente), le site public reste en ligne avec le contenu par défaut défini dans le code, et les demandes sont transmises uniquement par e-mail. Le back-office est alors indisponible.

## 3. Lancer le site en local

Copiez `.env.example` en `.env.local` et renseignez au minimum `DATABASE_URL` (une base Supabase ou un PostgreSQL 15+ local). Pour tester les formulaires sans envoyer d'e-mail :

```bash
CONTACT_DELIVERY_MODE=log
```

Les e-mails s'affichent alors dans le terminal. Ce mode est **ignoré en production**.

```bash
npm run dev            # http://localhost:3000, rechargement automatique
```

> Ouvrez le site via `http://localhost:3000` et non `127.0.0.1` : Next.js bloque ses ressources de développement sur une autre origine.

Autres commandes :

| Commande | Rôle |
|---|---|
| `npm run build` puis `npm run start` | Compilation et serveur de production |
| `npm run typecheck` | Vérification TypeScript (génère d'abord les types de Next.js, nécessaires sur une copie neuve) |
| `npm run check:architecture` | Contrôle de la séparation frontend / backend / shared |
| `npm run check:secrets` | Après `npm run build`, avec les mêmes variables : vérifie qu'aucun secret n'apparaît dans ce que reçoit le navigateur |
| `npm test` | Tests unitaires |
| `npm run test:db` | Tests d'intégration PostgreSQL (base `*_test` dédiée) |
| `npm run test:e2e` | Tests de bout en bout dans un navigateur (base `*_e2e` dédiée) |
| `npm run db:benchmark` | Mesure des requêtes sur un volume synthétique (base `*_test`) |

En cas de lenteur ou de blocage du back-office en local, voir [Dépannage du back-office en développement](#dépannage-du-back-office-en-développement).

## 4. Le back-office

Adresse : **`/admin`** (non indexé par les moteurs de recherche, réservé aux comptes créés).

| Écran | Contenu |
|---|---|
| **Tableau de bord** | Nouvelles demandes, demandes en cours, volume sur 30 jours, taux de transformation sur 90 jours, avis à modérer, informations légales encore manquantes |
| **Demandes** | Liste filtrable (statut, recherche sans accents sur nom, e-mail, société, ville, téléphone ; type, prestation, personne en charge, période), **export CSV** lisible dans Excel |
| **Fiche d'une demande** | Coordonnées cliquables, statut, attribution, notes internes, historique horodaté, invitation à laisser un avis, suppression (RGPD) |
| **Avis clients** | Modération (publier, refuser, remettre en attente, supprimer), création d'invitations |
| **Contenu du site** | Coordonnées et informations légales, affirmations commerciales, prestations (textes, photo, référencement), FAQ, secteurs |
| **Utilisateurs** | Comptes nominatifs, rôles, désactivation, réinitialisation du mot de passe |
| **Journal** | Qui a fait quoi et quand (connexions, changements de statut, exports, modifications…) |

**Rôles :**

| Rôle | Demandes | Avis, contenus, suppression de demandes | Comptes et journal |
|---|---|---|---|
| Propriétaire | ✓ | ✓ | ✓ |
| Éditeur | ✓ | ✓ | — |
| Commercial | ✓ | — | — |

**Avis clients authentiques.** Un avis ne peut être déposé que via un **lien personnel à usage unique** (valable 60 jours), créé depuis la fiche d'une demande gagnée ou l'écran « Avis clients ». Le client choisit s'il accepte la publication ; sans son accord, la base **refuse** la publication. Le contenu d'un avis ne peut pas être modifié (la base le bloque) : il peut seulement être publié, refusé ou supprimé. Aucun avis n'est affiché tant qu'aucun n'est publié.

**Sécurité des comptes :** mots de passe d'au moins 12 caractères, hachés (scrypt) ; mot de passe provisoire à changer à la première connexion ; verrouillage temporaire après 5 échecs ; sessions de 12 heures maximum, fermées après 2 heures d'inactivité ; chaque action vérifie la session et le rôle côté serveur.

## 5. Modifier les informations GAM CLEAN

Toutes les informations de l'entreprise et les textes des prestations se modifient dans **Back-office → Contenu du site**. Chaque enregistrement est **publié immédiatement** : les pages concernées sont régénérées automatiquement.

### Règle : rien n'est publié sans confirmation

- **Champ vide** : l'information est inconnue. Elle n'apparaît pas sur le site, sauf dans les mentions légales, où elle s'affiche comme `[À confirmer avec GAM CLEAN]`. Le tableau de bord liste ces informations manquantes.
- **Affirmations commerciales** (7j/7 et 24h/24, cordistes qualifiés, produits éco-responsables, assurance, QHSE, personnel formé) : **masquées** tant qu'elles ne sont pas cochées « confirmée ». Ne les confirmez que si GAM CLEAN peut le prouver.
- **Avis clients** : uniquement des avis réels, déposés par les clients eux-mêmes (section 4).

Le contenu par défaut (utilisé pour initialiser la base, et en secours si elle est injoignable) est dans `backend/modules/content/defaults.ts`. Les informations encore à obtenir sont détaillées dans [`docs/CONTENU-A-CONFIRMER.md`](docs/CONTENU-A-CONFIRMER.md).

## 6. Remplacer les photos

Les photos sont dans `frontend/assets/images/` et déclarées dans `frontend/assets/images.ts` sous une **clé** (`poste-de-travail`, `hall-vitres`…). Elles sont importées dans le code : Next.js génère automatiquement les versions AVIF et WebP, les tailles adaptées à chaque écran et le cache longue durée.

- **Photo d'une prestation :** Back-office → Contenu du site → Prestations → champ « Photo » (choix parmi les clés) et « Description de la photo » (texte alternatif).
- **Remplacer un fichier :** préparez un JPEG d'au moins **1 600 px de large** (paysage 4:3 ou 16:10) et remplacez le fichier **en gardant le même nom**, puis redéployez.
- **Ajouter une photo :** placez le fichier dans `frontend/assets/images/`, ajoutez sa clé dans `shared/constants/index.ts` (`IMAGE_KEYS`) et dans `frontend/assets/images.ts`, puis redéployez : elle devient sélectionnable dans le back-office.

Deux prestations n'ont pas encore de photo : **après sinistre** et **prestations spécialisées**. Elles affichent un panneau graphique sobre ; en développement, l'emplacement affiche **[PHOTO GAM CLEAN RECOMMANDÉE ICI]** avec la description de la photo idéale.

Provenance des visuels, droits à vérifier et photos à réaliser : [`docs/IMAGES.md`](docs/IMAGES.md).

## 7. Configurer les e-mails des demandes

Les formulaires « Demande de devis » (en trois étapes) et « Contact » envoient les demandes à `/api/demande`. Le serveur applique l'anti-abus et la validation, **enregistre la demande en base**, puis envoie une notification **par e-mail via [Resend](https://resend.com)** avec un lien direct vers la fiche dans le back-office.

1. Créez un compte Resend, puis **API Keys → Create API Key** ; ajoutez `RESEND_API_KEY` sur Vercel (section 8).
2. **Phase de test, sans nom de domaine :** gardez `CONTACT_FROM_EMAIL=GAM CLEAN <onboarding@resend.dev>`. Dans ce mode, Resend **ne livre qu'à l'adresse e-mail du compte Resend** : créez le compte avec l'adresse qui doit recevoir les demandes, ou passez à l'étape 3.
3. **Production :** dans Resend, **Domains → Add Domain**, ajoutez les enregistrements DNS indiqués (SPF, DKIM) chez votre registrar, puis définissez `CONTACT_FROM_EMAIL=GAM CLEAN <devis@votre-domaine.fr>`. Vous pouvez alors activer `SEND_CUSTOMER_CONFIRMATION=true` (accusé de réception au prospect) et l'envoi des invitations à laisser un avis par e-mail.

Les quotas et tarifs de Resend évoluent : vérifiez-les sur resend.com.

### Comportement garanti

- Le visiteur voit **« Merci, votre demande a bien été envoyée »** si la demande est **enregistrée en base ou** si l'e-mail est parti. Une demande enregistrée dont l'e-mail a échoué est signalée dans le back-office, et l'envoi est **retenté automatiquement chaque nuit** (tâche planifiée, section 10).
- Si ni l'enregistrement ni l'e-mail n'aboutissent, un message propose d'appeler ou d'écrire directement, avec le numéro et l'adresse cliquables.
- Les formulaires fonctionnent aussi **sans JavaScript** (envoi classique, redirection vers `/merci` ou `/envoi-impossible`).

### Anti-abus

Champ piège invisible, délai minimal de remplissage, validation stricte côté serveur (mêmes règles que dans le navigateur, et contraintes en base), tailles maximales, vérification de l'origine, et **limitation partagée entre toutes les instances** (5 envois par adresse IP toutes les 10 minutes, compteur en base ; les adresses IP n'y sont jamais stockées en clair).

## 8. Variables d'environnement

Le modèle est `.env.example`. **Ne commitez jamais de valeur réelle** : `.env` et `.env.local` sont ignorés par git. Les variables secrètes ne sont lues que côté serveur ; seules celles préfixées `NEXT_PUBLIC_` (non secrètes) sont visibles dans le navigateur.

| Variable | Obligatoire | Rôle |
|---|---|---|
| `DATABASE_URL` | **Oui** | Base Supabase, *Transaction pooler* (port 6543). **Secret.** |
| `DATABASE_URL_MIGRATIONS` | Non | Connexion pour `db:migrate` / `db:seed` (*Session pooler* ou directe). **Secret.** Par défaut : `DATABASE_URL`. |
| `APP_SECRET` | **Oui** | Chaîne aléatoire (≥ 32 caractères) pour les empreintes anti-abus. **Secret.** |
| `CRON_SECRET` | **Oui** | Protège la tâche de maintenance quotidienne. **Secret.** |
| `RESEND_API_KEY` | **Oui** | Clé API Resend. **Secret.** |
| `NEXT_PUBLIC_SITE_URL` | Recommandée | URL du site sans slash final. Sert au canonical, au sitemap, à Open Graph et aux liens des e-mails. Par défaut : domaine de production Vercel. |
| `CONTACT_TO_EMAIL` | Recommandée | Boîte qui reçoit les demandes. Par défaut : l'e-mail des coordonnées du site. |
| `CONTACT_FROM_EMAIL` | Recommandée | Expéditeur (section 7). |
| `DB_POOL_MAX` | Non | Connexions par instance (1 à 20, défaut 3). |
| `DB_PREPARED_STATEMENTS` | Non | `true` : un aller-retour réseau par requête au lieu de deux. Uniquement avec une connexion directe ou le *Session pooler* (port 5432), par exemple en développement local ; ignoré avec le *Transaction pooler* (port 6543). |
| `SEND_CUSTOMER_CONFIRMATION` | Non | `true` pour l'accusé de réception (domaine vérifié requis). |
| `CONTACT_DELIVERY_MODE` | Non | `log` en développement uniquement. |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | Non | `vercel` ou `plausible` (annexes). |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Si Plausible | Domaine déclaré dans Plausible. |

Pour générer un secret : `openssl rand -base64 48`.

Sur Vercel : **Project → Settings → Environment Variables**, cochez **Production** (et **Preview** si besoin), puis **redéployez** : les variables ne s'appliquent qu'aux nouveaux déploiements.

## 9. Créer le dépôt GitHub

**Option A : nouveau dépôt dédié au site (recommandé).**

1. Sur github.com, **New repository**, par exemple `gam-clean-site`, en **Private**, sans README.
2. Depuis le dossier `gam-clean-site/` :

```bash
git init
git add .
git commit -m "Site GAM CLEAN"
git branch -M main
git remote add origin https://github.com/<votre-compte>/gam-clean-site.git
git push -u origin main
```

**Option B : garder le site dans le dépôt actuel.** Il se trouve alors dans le sous-dossier `gam-clean-site/` : il faudra l'indiquer à Vercel (section 10, *Root Directory*).

## 10. Connecter le dépôt à Vercel et déployer

1. Créez un compte sur vercel.com, idéalement en vous connectant avec GitHub.
2. **Add New… → Project**, choisissez le dépôt et cliquez sur **Import**. Vercel détecte Next.js : laissez les commandes par défaut.
3. **Root Directory :** vide pour l'option A ; `gam-clean-site` pour l'option B.
4. Ajoutez les variables d'environnement (section 8), puis **Deploy**.
5. Une fois la base prête (section 2), le site lit son contenu dans Supabase. Après le **premier** déploiement réalisé avec `DATABASE_URL`, les pages publiques sont générées à partir de la base.

Ensuite, chaque `git push` sur `main` redéploie la production. Les autres branches créent des **prévisualisations**, automatiquement non indexées (`robots.txt` et balise `noindex`).

**Tâche planifiée.** `vercel.json` déclare une tâche quotidienne (`/api/cron/maintenance`, vers 3 h 17 UTC) qui supprime les données arrivées à échéance (demandes inactives au-delà de la durée de conservation, sessions expirées…) et renvoie les notifications e-mail en échec. Elle exige `CRON_SECRET`. Selon l'offre Vercel, le nombre et la précision horaire des tâches planifiées sont limités : une exécution par jour suffit ici (à vérifier sur vercel.com/docs).

**Offre Vercel.** L'offre gratuite **Hobby** est réservée, selon les conditions de Vercel, à un **usage personnel et non commercial**. Un site d'entreprise relève en principe de l'offre **Pro** (payante). Vérifiez les conditions en vigueur sur vercel.com/pricing. De même, vérifiez les limites de l'offre Supabase choisie (taille de base, sauvegardes, mise en veille des projets inactifs) sur supabase.com/pricing.

## 11. Connecter un nom de domaine

1. Achetez le domaine chez un registrar (OVHcloud, Gandi…), par exemple `gamclean.fr`, après avoir vérifié sa disponibilité.
2. Sur Vercel, **Project → Settings → Domains → Add** : `www.votre-domaine.fr` et `votre-domaine.fr`.
3. Créez chez le registrar les enregistrements DNS **affichés par Vercel**. Le certificat HTTPS est automatique.
4. Définissez `NEXT_PUBLIC_SITE_URL=https://www.votre-domaine.fr` et redéployez.
5. Vérifiez le domaine dans Resend (section 7) et créez une adresse e-mail professionnelle sur ce domaine.
6. Déclarez le site dans **Google Search Console** et soumettez `https://www.votre-domaine.fr/sitemap.xml`.
7. Mettez à jour la fiche **Google Business Profile** avec l'URL du site.

## 12. Tests et contrôles qualité

Résultats **réellement obtenus** sur la version livrée (environnement de développement : Node.js 22, PostgreSQL 16 local, Chromium 141 via Playwright 1.56) :

| Contrôle | Commande | Résultat |
|---|---|---|
| Types TypeScript | `npm run typecheck` | 0 erreur |
| Séparation des couches | `npm run check:architecture` | 150 fichiers, 0 violation |
| Tests unitaires (validation, téléphones, CSV, mots de passe, jetons, droits, curseurs) | `npm test` | 30 / 30 réussis |
| Tests d'intégration PostgreSQL (migrations, contraintes, triggers, droits des rôles, RLS, pagination, recherche, purge RGPD, anti-abus) | `npm run test:db` | 16 / 16 réussis |
| Tests de bout en bout (navigateur réel) : formulaire en 3 étapes, envoi sans JavaScript, FAQ, 404, en-têtes, mobile, back-office complet (connexion, mot de passe imposé, demandes, avis à usage unique, modération, contenus publiés immédiatement, export CSV, rôles, verrouillage, journal) | `npm run test:e2e` | 45 / 45 réussis |
| Accessibilité (axe-core, WCAG 2.2 A/AA, violations graves ou critiques) | inclus dans `test:e2e` | 0 sur 14 pages (8 publiques, 6 du back-office) |
| Compilation de production | `npm run build` | réussie |
| Aucun secret dans ce que reçoit le navigateur (JavaScript, CSS, pages pré-générées) | `npm run check:secrets` | 0 fuite sur 286 fichiers, en cherchant les valeurs de `DATABASE_URL`, `APP_SECRET` et `CRON_SECRET` utilisées à la compilation, ainsi que les motifs de clé Resend et de chaîne de connexion avec mot de passe. Le contrôle a été validé en plaçant volontairement de faux secrets dans la compilation : tous détectés |
| Lighthouse 12.8 (mobile simulé, serveur de production local) | manuel | Performance 95 à 98, Accessibilité 100, Bonnes pratiques 100, SEO 100 sur l'accueil, une page de prestation, devis, FAQ et contact. Trois mesures par page : 14 ont abouti, la 15e a été interrompue par une erreur de Lighthouse |
| Performances de la base (100 000 demandes) | `npm run db:benchmark` | voir [`docs/BASE-DE-DONNEES.md`](docs/BASE-DE-DONNEES.md#mesures) |

**Non testé dans cet environnement** (à vérifier lors de la mise en ligne) : connexion à un projet Supabase réel (les tests ont utilisé PostgreSQL 16 avec les mêmes extensions `pg_trgm` et `unaccent`), envoi réel d'e-mails par Resend (aucune clé API disponible : le mode `log` et l'absence de clé ont été testés), déploiement Vercel et exécution de la tâche planifiée par Vercel (la route a été testée directement), rôle de connexion à privilèges minimaux sur Supabase (vérifié sur PostgreSQL 16 local uniquement), nom de domaine.

---

## Annexes

### Structure du projet

```
app/                    Routes uniquement : chaque page charge ses données (backend) et les passe à une vue (frontend)
  (site)/               Site public : accueil, prestations, secteurs, entreprise, FAQ, devis, contact, avis/[jeton]…
  admin/                Back-office : connexion, (espace)/ demandes, avis, contenu, utilisateurs, compte, journal
  api/                  demande (formulaires), admin/export/demandes (CSV), cron/maintenance
  sitemap.ts  robots.ts  manifest.ts  not-found.tsx  icônes et images Open Graph
frontend/               Interface : reçoit ses données par props, n'accède jamais à la base
  views/site/  views/admin/     Pages complètes
  components/                   Mise en page, sections, formulaires, back-office, éléments d'interface
  assets/  styles/  config/  lib/
backend/                Serveur uniquement
  db/                   Client PostgreSQL, migrations SQL versionnées, lanceur, contenu initial
  modules/              Contenus, demandes, avis, comptes, authentification, journal, maintenance
  actions/              Actions serveur du back-office (droits vérifiés dans chacune)
  integrations/email.ts  security/  config/env.ts
shared/                 Types, constantes, validation et droits communs (sans dépendance)
scripts/                Migrations, contenu initial, création de compte, mesures, contrôle d'architecture
tests/                  unit/ (node:test), db/ (PostgreSQL), e2e/ (Playwright)
docs/                   Architecture, base de données, images, contenu à confirmer, design system
proxy.ts                Redirection rapide vers la connexion (la vraie protection est côté serveur)
vercel.json             Tâche planifiée quotidienne
```

### Sécurité

- **En-têtes** (`next.config.ts`) : CSP, HSTS, X-Frame-Options, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, COOP ; `X-Robots-Tag: noindex` sur le back-office et les liens d'avis.
- **Aucun secret côté client** : les secrets ne sont lus que dans `backend/config/env.ts` (serveur uniquement), et `npm run check:secrets` le vérifie sur la compilation. Aucune ressource tierce chargée par défaut (polices auto-hébergées, pas d'iframe, pas de CDN).
- **Base** : schéma non exposé par l'API de Supabase, droits retirés aux rôles publics, sécurité au niveau des lignes sur toutes les tables, requêtes toujours paramétrées. Détails : [`docs/BASE-DE-DONNEES.md`](docs/BASE-DE-DONNEES.md#sécurité).
- **Back-office** : sessions en base (révocables), cookie `HttpOnly` / `Secure` / `SameSite=Lax` (préfixe `__Host-` en production), contrôle des droits dans chaque page, action et route ; journal d'audit.
- **Export CSV** protégé contre l'injection de formules.

### Mesure des conversions

Mesurés : clics « Demander un devis » (avec leur emplacement), clics téléphone et e-mail, étapes franchies dans le formulaire de devis, envois réussis ou en échec. L'URL `/merci?demande=devis` sert aussi d'objectif.

Aucune mesure n'est active par défaut :

- **Vercel Web Analytics** (sans cookie) : activez *Analytics* dans le projet Vercel, puis `NEXT_PUBLIC_ANALYTICS_PROVIDER=vercel`. Les événements personnalisés peuvent dépendre de l'offre Vercel : à vérifier.
- **Plausible** (sans cookie, payant) : `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible` et `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=votre-domaine.fr`.

La politique de confidentialité s'adapte automatiquement. N'ajoutez pas Google Analytics sans bannière de consentement.

### Redirections depuis l'ancien site

Configurées en 308 (permanentes) dans `next.config.ts` :

| Ancienne URL | Nouvelle URL |
|---|---|
| `/services` | `/prestations` |
| `/qui-sommes-nous` | `/a-propos` |
| `/notre-methode` | `/a-propos#methode` |
| `/nos-engagements` | `/a-propos` |
| `/references` | `/a-propos` |
| `/nous-localiser` | `/contact` |

### Dépannage du back-office en développement

**Toutes les pages restent sur « Chargement de la page… », même après une nouvelle connexion.** C'est le symptôme d'une connexion à la base coupée silencieusement (réseau, pooler) : elle ne répond plus mais n'est pas fermée, et les requêtes suivantes s'y empilent. Désormais, toute requête qui dépasse 12 secondes échoue avec une erreur explicite dans le terminal (`[base] La base de données n'a pas répondu dans le délai…`), le pool de connexions est remplacé et la page affiche « Page indisponible » avec un bouton « Réessayer ». Si ce message revient souvent, la liaison avec la base est instable : vérifiez le réseau, ou utilisez le *Session pooler* ou une base locale en développement.

**L'écran reste en chargement après un clic ou un enregistrement, et un rechargement complet (F5) répare.** Vérifiez d'abord le cookie `next-instant-navigation-testing`. Le *Navigation Inspector* des Next.js DevTools le pose pour mettre les navigations en pause (option *Pause on navigations*). Tant qu'il existe, Next.js retient les changements de page en développement. Ce cookie est lié à `localhost` et non au port : un autre projet Next.js ouvert en local peut le laisser derrière lui.

- Le back-office affiche alors un bandeau rouge, en développement uniquement, avec un bouton « Désactiver et recharger ».
- Sinon, fermez le panneau *Navigation Inspector*, ou supprimez le cookie dans les outils du navigateur (*Application → Cookies → localhost*).
- Ce mécanisme n'existe pas en production.

**Le bouton « Se déconnecter » ne réagit pas.** En bas à gauche, l'indicateur des Next.js DevTools le recouvrait. L'indicateur est désormais placé en bas à droite (`devIndicators` dans `next.config.ts`).

**Tout est lent avec une base Supabase distante.** Mesuré avec 200 ms d'aller-retour réseau :

- chaque requête paramétrée coûte deux allers-retours (environ 400 ms) ;
- chaque nouvelle connexion coûte environ 1,4 s (chiffrement et authentification).

Pour accélérer le développement local :

- utilisez le *Session pooler* (port 5432) dans `DATABASE_URL` avec `DB_PREPARED_STATEMENTS=true`, ce qui divise par deux le temps des requêtes ;
- ou utilisez une base PostgreSQL locale.

Hors production, les connexions inactives restent ouvertes 10 minutes au lieu de 20 secondes. Au-delà de 15 secondes d'attente, les formulaires du back-office affichent un message avec un bouton de rechargement.

**Projet dans un dossier synchronisé (OneDrive, Dropbox…).** Next.js écrit de très nombreux fichiers dans `.next` : la synchronisation peut ralentir ou verrouiller ces fichiers. Placez le projet hors du dossier synchronisé, par exemple `C:\dev\gam-clean-site`.

**En production**, choisissez pour les fonctions Vercel la même région que la base Supabase. Le réglage s'appelle *Function Region* dans les paramètres du projet Vercel ; on peut aussi utiliser la clé `regions` de `vercel.json` (intitulés à vérifier dans la documentation Vercel). L'aller-retour vers la base devient alors très court.

### Check-list avant mise en ligne

- [ ] Base Supabase créée dans l'UE, `npm run db:migrate` et `npm run db:seed` exécutés, premier compte créé.
- [ ] Variables `DATABASE_URL`, `APP_SECRET`, `CRON_SECRET`, `RESEND_API_KEY` définies sur Vercel.
- [ ] Tableau de bord : informations légales complétées (aucune « information à compléter » obligatoire).
- [ ] E-mail de réception confirmé ; domaine vérifié dans Resend.
- [ ] Test réel : une demande de devis apparaît dans le back-office et arrive dans la boîte de GAM CLEAN.
- [ ] Durée de conservation des demandes validée par GAM CLEAN (36 mois par défaut, réglable dans les coordonnées).
- [ ] `NEXT_PUBLIC_SITE_URL` renseignée avec le domaine définitif.
- [ ] Droits d'utilisation des photos confirmés (`docs/IMAGES.md`).
- [ ] Offres Vercel et Supabase adaptées à un usage commercial.
- [ ] Search Console : sitemap soumis.
