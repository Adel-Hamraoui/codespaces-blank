# Design system GAM CLEAN

Les jetons de design (couleurs, typographie, espacements, rayons) sont définis dans `frontend/styles/globals.css`. Les composants ont chacun leur feuille de style (CSS Modules, `*.module.css`), qui s'appuie sur ces jetons.

## Direction artistique : « précision et clarté »

- **Bleu nuit** (repris du logo) : couleur d'autorité, utilisée pour les blocs sombres, le pied de page et les pastilles d'icônes.
- **Vert profond** : couleur d'action, pour tous les boutons principaux.
- **Menthe** : accent lumineux, uniquement sur fond sombre.
- **Dégradé vert → bleu du logo** : réservé à la marque (filet de 3 px en haut de page). Jamais en grand aplat.
- **Motif distinctif :** une trame « plan technique » très discrète (grille de 48 px) dans les en-têtes, et l'étoile à 4 branches du logo comme puce des surtitres.
- **Mouvement mesuré.** Pas de carrousel. Les sections apparaissent en fondu léger au défilement : l'animation est en CSS seul, pilotée par le défilement et activée uniquement si le navigateur la prend en charge. Tout contenu est entièrement visible dès qu'il est à l'écran. Les autres animations sont fonctionnelles : survol, menu, accordéons, passage d'une étape à l'autre du formulaire de devis, indicateurs de chargement. **Toutes sont désactivées avec `prefers-reduced-motion`**, et l'apparition au défilement est désactivée à l'impression.

## Couleurs (contraste calculé selon WCAG 2)

| Jeton | Valeur | Usage | Contraste |
|---|---|---|---|
| `--navy-900` | #0A2342 | fonds sombres | blanc dessus : 15,8:1 |
| `--green-700` | #0B7A4B | boutons principaux | blanc dessus : 5,4:1 |
| `--mint-300` | #6EE7B7 | accent sur sombre | sur navy-900 : 10,3:1 |
| `--blue-700` | #1747A6 | liens | sur blanc : 8,4:1 |
| `--ink` | #0B1B2B | titres | sur blanc : 17,4:1 |
| `--muted` | #475569 | texte secondaire | sur blanc : 7,6:1 |
| `--on-dark-muted` | #C2C8D0 | texte secondaire sur sombre | sur navy-900 : 9,4:1 |

Toutes les paires dépassent le seuil WCAG AA (4,5:1 pour le texte courant). Les contrôles automatiques d'accessibilité (axe-core, `npm run test:e2e`) vérifient en plus le contraste réel des pages rendues.

## Typographie

- **Titres :** Manrope, auto-hébergée via `next/font` (environ 25 Ko). Graisses 600 à 800, interlettrage resserré.
- **Texte :** police système (aucun téléchargement, affichage immédiat).
- **Tailles fluides** (`clamp`) : H1 de 2,1 à 3,75 rem ; H2 de 1,75 à 2,6 rem. Texte courant : 17 px (`--fs-base`).

## Composants du site

- **Boutons** (`.btn`, `.btn-secondary`, `.btn-on-dark`, `.btn-ghost-dark`, `.btn-lg`, `.btn-block`) : 48 px de haut minimum (56 px en grand), forme pilule.
- **Cartes :** bordure de 1 px, rayon de 14 px (`--r-md`), ombre légère, élévation au survol.
- **Focus :** contour de 3 px (`--focus`), menthe sur fond sombre.
- **Formulaires :** champs de 50 px de haut, police de 16 px (pas de zoom automatique sur iOS), choix multiples présentés en pastilles de 44 px ; formulaire de devis en trois étapes avec indicateur de progression.
- **Cibles tactiles :** 44 px minimum.
- **Mobile :** barre d'actions fixe en bas d'écran (« Appeler », « Devis ») ; sur la page de devis, le bouton « Devis » disparaît.

## Back-office

Feuille de style : `frontend/components/admin/admin.module.css`, avec les mêmes jetons que le site.

- **Sobre et dense :** fond gris clair, surfaces blanches, navigation bleu nuit ; l'information prime sur la décoration.
- **Navigation :** barre latérale fixe à partir de 1 024 px ; en dessous, barre supérieure et menu coulissant. Le nombre de nouvelles demandes s'affiche en pastille à côté de « Demandes ».
- **Tableaux :** ligne entière cliquable. Sous 760 px, chaque ligne devient une carte dont chaque valeur porte son intitulé (attribut `data-label`) : aucun défilement horizontal.
- **Statuts :** pastilles de couleur, toujours accompagnées de leur libellé (la couleur n'est jamais la seule information).
- **Filtres :** statut et recherche toujours visibles ; filtres secondaires regroupés dans « Plus de filtres », ouvert automatiquement quand l'un d'eux est actif.
- **Retours d'action :** message de confirmation ou d'erreur après chaque enregistrement ; erreurs de validation affichées sous le champ concerné, sans perte de la saisie.
