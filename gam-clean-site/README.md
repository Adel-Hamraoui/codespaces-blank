# Site vitrine GAM CLEAN

Site de GAM CLEAN, entreprise de nettoyage professionnel basée à Bondy (93). Il remplace la version précédente générée sur Genspark.

- **Stack :** Next.js 16 (App Router), React 19, TypeScript, CSS Modules. Une seule dépendance d'interface : `lucide-react` pour les icônes.
- **Rendu :** toutes les pages sont générées à l'avance (statiques). Seule la route `/api/demande`, qui reçoit les formulaires, s'exécute côté serveur.
- **Hébergement visé :** Vercel.

---

## Sommaire

1. [Installer le projet](#1-installer-le-projet)
2. [Lancer le site en local](#2-lancer-le-site-en-local)
3. [Modifier les informations GAM CLEAN](#3-modifier-les-informations-gam-clean)
4. [Remplacer les photos](#4-remplacer-les-photos)
5. [Configurer le formulaire de devis et de contact](#5-configurer-le-formulaire)
6. [Variables d'environnement](#6-variables-denvironnement)
7. [Créer le dépôt GitHub](#7-créer-le-dépôt-github)
8. [Connecter le dépôt à Vercel](#8-connecter-le-dépôt-à-vercel)
9. [Déployer gratuitement sur Vercel](#9-déployer-sur-vercel)
10. [Connecter un nom de domaine](#10-connecter-un-nom-de-domaine)
11. [Annexes : structure, mesure d'audience, sécurité, check-list](#annexes)

---

## 1. Installer le projet

Prérequis : **Node.js 22.18 ou plus récent** (`node -v` pour vérifier) et npm.

```bash
cd gam-clean-site
npm install
```

## 2. Lancer le site en local

```bash
npm run dev          # http://localhost:3000, rechargement automatique
```

Pour tester le formulaire sans envoyer d'e-mail, créez un fichier `.env.local` contenant :

```bash
CONTACT_DELIVERY_MODE=log
```

Chaque demande s'affiche alors dans le terminal. Ce mode est **ignoré en production**.

Autres commandes :

```bash
npm run build          # compilation de production (vérifie aussi les types)
npm run start          # sert la version compilée
npm run typecheck      # vérification TypeScript seule
npm run check:content  # liste les informations GAM CLEAN encore à confirmer
```

> En développement, ouvrez le site via `http://localhost:3000` et non `127.0.0.1` : Next.js bloque ses ressources de développement sur une autre origine.

## 3. Modifier les informations GAM CLEAN

Tout le contenu est centralisé dans le dossier `content/`. Il n'y a rien à chercher ailleurs.

| Fichier | Contenu |
|---|---|
| `content/site.ts` | **Coordonnées, informations légales, zone, horaires, affirmations commerciales, témoignages** |
| `content/service-index.ts` | Nom, résumé et icône de chaque prestation (menus, cartes, formulaire) |
| `content/services.ts` | Contenu détaillé des pages de prestations |
| `content/sectors.ts` | Secteurs d'intervention |
| `content/faq.ts` | Questions fréquentes |
| `content/method.ts` | Déroulement d'une demande (4 étapes) |
| `content/navigation.ts` | Menus |

### Règle : rien n'est publié sans confirmation

- **Valeur `null`** : l'information est inconnue. Elle n'apparaît pas sur le site, sauf dans les mentions légales, où elle s'affiche comme `[À confirmer avec GAM CLEAN]`.
- **`claims`** : les affirmations de l'ancienne plaquette (7j/7 et 24h/24, cordistes qualifiés, produits éco-responsables, assurance, QHSE, personnel formé) restent **masquées** tant que `confirmed: false`. Passez à `true` uniquement si GAM CLEAN peut le prouver. Elles apparaissent alors automatiquement dans « Pourquoi GAM CLEAN », la FAQ et les pages concernées.
- **`testimonials`** : liste vide, donc la section témoignages est masquée. N'ajoutez que de vrais avis, avec l'accord écrit du client.

Avant chaque mise en ligne, lancez :

```bash
npm run check:content
```

Le détail des informations à obtenir est dans [`docs/CONTENU-A-CONFIRMER.md`](docs/CONTENU-A-CONFIRMER.md).

## 4. Remplacer les photos

Les photos sont dans `assets/images/`. Elles sont **importées** dans le code, ce qui permet à Next.js de générer automatiquement les versions AVIF et WebP, les tailles adaptées à chaque écran et le cache longue durée.

Pour remplacer une photo :

1. Préparez un JPEG d'au moins **1 600 px de large**, au format paysage 4:3 ou 16:10.
2. Remplacez le fichier dans `assets/images/` **en gardant le même nom**, ou ajoutez-en un nouveau et mettez à jour l'`import` correspondant (dans `content/services.ts`, `components/sections/HomeHero.tsx`, `app/page.tsx` ou `app/a-propos/page.tsx`).
3. Mettez à jour le texte alternatif (`alt`) pour qu'il décrive la nouvelle photo.

Deux prestations n'ont pas encore de photo : **après sinistre** et **prestations spécialisées**. Elles affichent un panneau graphique sobre. Pour leur en donner une, ajoutez `image: { src, alt }` à la prestation dans `content/services.ts`.

En développement, chaque emplacement concerné affiche la mention **[PHOTO GAM CLEAN RECOMMANDÉE ICI]** avec la description de la photo idéale.

Provenance des visuels actuels, droits à vérifier et liste des photos à réaliser : [`docs/IMAGES.md`](docs/IMAGES.md).

## 5. Configurer le formulaire

Les formulaires « Demande de devis » et « Contact » envoient les demandes à `/api/demande`. Cette route valide les données côté serveur, applique l'anti-spam, puis transmet la demande **par e-mail via [Resend](https://resend.com)** à la boîte de GAM CLEAN.

**Pourquoi Resend :**
- simple API HTTP, sans dépendance à installer ;
- offre gratuite adaptée au volume d'un site vitrine (les quotas et tarifs sont à vérifier sur resend.com/pricing, car ils évoluent) ;
- fonctionne nativement depuis Vercel.

### Mise en place

1. Créez un compte sur resend.com, puis **API Keys → Create API Key**.
2. Sur Vercel, ajoutez la variable `RESEND_API_KEY` (voir section 6).
3. **Phase de test, sans nom de domaine :** gardez `CONTACT_FROM_EMAIL=GAM CLEAN <onboarding@resend.dev>`. Attention : dans ce mode, Resend **ne livre qu'à l'adresse e-mail du compte Resend**. Créez donc le compte Resend avec l'adresse qui doit recevoir les demandes, ou passez à l'étape 4.
4. **Production :** dans Resend, **Domains → Add Domain**, ajoutez les enregistrements DNS indiqués (SPF, DKIM) chez votre registrar, puis définissez `CONTACT_FROM_EMAIL=GAM CLEAN <devis@votre-domaine.fr>`. Vous pouvez alors aussi activer `SEND_CUSTOMER_CONFIRMATION=true` (accusé de réception envoyé au prospect).

### Comportement garanti

- Le visiteur ne voit **« Merci, votre demande a bien été envoyée »** que si l'e-mail est réellement parti.
- En cas d'échec (clé absente, service indisponible), un message lui propose d'appeler ou d'écrire directement, avec le numéro et l'adresse cliquables. L'erreur est inscrite dans les journaux Vercel.
- Le formulaire fonctionne aussi **sans JavaScript** : envoi HTML classique, redirection vers `/merci` ou `/envoi-impossible`.

### Anti-spam

Champ piège invisible, délai minimal de remplissage, validation stricte et tailles maximales côté serveur, vérification de l'origine, et limitation à 5 envois par adresse IP toutes les 10 minutes.

La limitation est faite en mémoire, instance par instance. Pour une protection plus forte, ajoutez une règle de limitation de débit dans **Vercel → Firewall** (disponibilité selon votre offre).

### Autres solutions possibles

Formspree, Web3Forms ou Brevo. Il suffit de remplacer la fonction `deliverRequest` dans `lib/delivery.ts`.

## 6. Variables d'environnement

Le fichier modèle est `.env.example`. **Ne commitez jamais de clé réelle** : `.env` et `.env.local` sont ignorés par git.

| Variable | Obligatoire | Rôle |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommandée | URL du site sans slash final (ex. `https://www.gamclean.fr`). Sert au canonical, au sitemap, à Open Graph et aux données structurées. Par défaut : le domaine de production Vercel. |
| `RESEND_API_KEY` | **Oui** | Clé API Resend. **Secret** : uniquement côté serveur. |
| `CONTACT_TO_EMAIL` | Recommandée | Boîte qui reçoit les demandes. Par défaut : l'e-mail de `content/site.ts`. |
| `CONTACT_FROM_EMAIL` | Recommandée | Expéditeur (voir section 5). |
| `SEND_CUSTOMER_CONFIRMATION` | Non | `true` pour envoyer un accusé de réception (domaine vérifié requis). |
| `CONTACT_DELIVERY_MODE` | Non | `log` en développement uniquement. |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | Non | `vercel` ou `plausible` (voir annexes). |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Si Plausible | Domaine déclaré dans Plausible. |

Sur Vercel : **Project → Settings → Environment Variables**, cochez **Production** (et **Preview** si besoin), puis **redéployez** : les variables ne s'appliquent qu'aux nouveaux déploiements.

## 7. Créer le dépôt GitHub

**Option A : nouveau dépôt dédié au site (recommandé).**

1. Sur github.com, **New repository**, par exemple `gam-clean-site`, en **Private**, sans README.
2. Dans un terminal, depuis le dossier `gam-clean-site/` :

```bash
git init
git add .
git commit -m "Site GAM CLEAN"
git branch -M main
git remote add origin https://github.com/<votre-compte>/gam-clean-site.git
git push -u origin main
```

**Option B : garder le site dans le dépôt actuel.** Il se trouve alors dans le sous-dossier `gam-clean-site/` : il faudra l'indiquer à Vercel (section 8, *Root Directory*).

## 8. Connecter le dépôt à Vercel

1. Créez un compte sur vercel.com, idéalement en vous connectant avec GitHub.
2. **Add New… → Project**, choisissez le dépôt et cliquez sur **Import**.
3. Vercel détecte Next.js automatiquement. Laissez les commandes par défaut.
4. **Root Directory :** laissez vide pour l'option A ; choisissez `gam-clean-site` pour l'option B.
5. Ajoutez les variables d'environnement (section 6), puis cliquez sur **Deploy**.

Ensuite, chaque `git push` sur `main` redéploie la production. Les autres branches créent des **prévisualisations**, qui ne sont automatiquement pas indexées par Google (`robots.txt` et balise `noindex`).

## 9. Déployer sur Vercel

Le déploiement se fait en un clic (section 8). **Attention aux conditions de l'offre gratuite :** l'offre **Hobby** de Vercel est réservée, selon les conditions de Vercel, à un **usage personnel et non commercial**. Un site d'entreprise relève en principe de l'offre **Pro** (payante). Vérifiez les conditions en vigueur sur vercel.com/pricing avant la mise en ligne définitive.

Si la gratuité est impérative, le projet peut aussi être hébergé sur un autre service compatible Next.js. Cela demande une adaptation de l'hébergement, et éventuellement de la route `/api/demande`.

## 10. Connecter un nom de domaine

1. Achetez le domaine chez un registrar (OVHcloud, Gandi, etc.), par exemple `gamclean.fr`, après avoir vérifié sa disponibilité.
2. Sur Vercel, **Project → Settings → Domains → Add**, puis saisissez `www.votre-domaine.fr` et `votre-domaine.fr`.
3. Créez chez le registrar les enregistrements DNS **affichés par Vercel** (en général un `A` pour le domaine nu et un `CNAME` pour `www`). Le certificat HTTPS est automatique.
4. Définissez `NEXT_PUBLIC_SITE_URL=https://www.votre-domaine.fr` et redéployez.
5. Vérifiez le domaine dans Resend (section 5) et créez une adresse e-mail professionnelle sur ce domaine.
6. Déclarez le site dans **Google Search Console** et soumettez `https://www.votre-domaine.fr/sitemap.xml`.
7. Mettez à jour la fiche **Google Business Profile** avec l'URL du site.

---

## Annexes

### Structure du projet

```
app/                       Pages (une URL = un dossier) et route API
  page.tsx                 Accueil
  prestations/             Index + [slug] (7 pages de prestations)
  secteurs/  a-propos/  faq/  contact/  devis/  merci/  envoi-impossible/
  mentions-legales/  politique-de-confidentialite/
  api/demande/route.ts     Réception des formulaires
  sitemap.ts  robots.ts  manifest.ts  icon.png  apple-icon.png  opengraph-image.jpg
assets/                    Photos et logos (optimisés automatiquement)
components/
  layout/                  En-tête, pied de page, barre d'actions mobile
  sections/                Blocs de page (hero, prestations, méthode, FAQ, CTA…)
  forms/RequestForm.tsx    Formulaire devis / contact (validation accessible)
  ui/  seo/  analytics/
content/                   TOUT le contenu éditable (voir section 3)
lib/                       SEO, validation, envoi e-mail, anti-spam, mesure
docs/                      Images, contenu à confirmer, design system
scripts/check-content.mjs  Contrôle des informations manquantes
```

### Mesure des conversions

Sont mesurés : clics « Demander un devis » (avec leur emplacement), clics téléphone, clics e-mail, envois de formulaire réussis ou en échec. L'URL `/merci` sert aussi d'objectif de conversion.

Aucune mesure n'est active par défaut. Pour l'activer :

- **Vercel Web Analytics** (sans cookie) : activez *Analytics* dans le projet Vercel, puis `NEXT_PUBLIC_ANALYTICS_PROVIDER=vercel`. Les événements personnalisés peuvent dépendre de l'offre Vercel : à vérifier.
- **Plausible** (sans cookie, payant) : `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible` et `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=votre-domaine.fr`.

La politique de confidentialité s'adapte automatiquement au choix. N'ajoutez pas Google Analytics sans bannière de consentement.

### Sécurité

- **En-têtes** (dans `next.config.ts`) : CSP, HSTS, X-Frame-Options, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, COOP.
- **Aucun secret côté client.** Aucune ressource tierce chargée par défaut : les polices sont auto-hébergées, il n'y a ni iframe Google Maps ni CDN.

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

`/devis`, `/contact`, `/secteurs`, `/faq`, `/mentions-legales` et `/politique-de-confidentialite` conservent la même adresse.

### Check-list avant mise en ligne

- [ ] `npm run check:content` : informations légales complètes.
- [ ] E-mail de réception confirmé ; domaine vérifié dans Resend.
- [ ] Test réel : une demande de devis arrive bien dans la boîte de GAM CLEAN.
- [ ] `NEXT_PUBLIC_SITE_URL` renseignée avec le domaine définitif.
- [ ] Droits d'utilisation des photos confirmés (`docs/IMAGES.md`).
- [ ] Offre Vercel adaptée à un usage commercial.
- [ ] Search Console : sitemap soumis.
