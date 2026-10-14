# Design system GAM CLEAN

Les jetons de design (couleurs, typographie, espacements, formes) sont définis dans `app/globals.css`.

## Direction artistique : « précision et clarté »

- **Bleu nuit** (repris du logo) : couleur d'autorité, utilisée pour les blocs sombres, le pied de page et les pastilles d'icônes.
- **Vert profond** : couleur d'action, pour tous les boutons principaux.
- **Menthe** : accent lumineux, uniquement sur fond sombre.
- **Dégradé vert → bleu du logo** : réservé à la marque (filet de 3 px en haut de page). Jamais en grand aplat.
- **Motif distinctif :** une trame « plan technique » très discrète (grille de 48 px) dans les en-têtes, et l'étoile à 4 branches du logo comme puce des surtitres.
- **Pas de carrousel, pas d'animation décorative.** Seules les transitions de survol, d'ouverture de menu ou d'accordéon sont animées, et elles sont désactivées avec `prefers-reduced-motion`.

## Couleurs (contraste mesuré)

| Jeton | Valeur | Usage | Contraste |
|---|---|---|---|
| `--navy-900` | #0A2342 | fonds sombres | blanc dessus : 15,8:1 |
| `--green-700` | #0B7A4B | boutons principaux | blanc dessus : 5,4:1 |
| `--mint-300` | #6EE7B7 | accent sur sombre | sur navy-900 : 10,3:1 |
| `--blue-700` | #1747A6 | liens | sur blanc : 8,4:1 |
| `--ink` | #0B1B2B | titres | sur blanc : 17,4:1 |
| `--muted` | #475569 | texte secondaire | sur blanc : 7,6:1 |
| `--on-dark-muted` | #C2C8D0 | texte secondaire sur sombre | 9,4:1 |

## Typographie

- **Titres :** Manrope, auto-hébergée via `next/font` (environ 25 Ko). Graisses 600 à 800, interlettrage resserré.
- **Texte :** police système (aucun téléchargement, affichage immédiat).
- **Tailles fluides** (`clamp`) : H1 de 2,1 à 3,75 rem ; H2 de 1,75 à 2,6 rem. Texte courant : 17 px.

## Composants

- **Boutons** (`.btn`, `.btn-secondary`, `.btn-on-dark`, `.btn-ghost-dark`, `.btn-lg`) : 48 px de haut minimum (56 px en grand), forme pilule.
- **Cartes :** bordure de 1 px, rayon de 14 px, ombre légère, élévation au survol.
- **Focus :** contour bleu de 3 px, menthe sur fond sombre.
- **Formulaires :** champs de 50 px de haut, police de 16 px (pas de zoom sur iOS), choix multiples présentés en pastilles de 44 px.
- **Cibles tactiles :** 44 px minimum partout.
