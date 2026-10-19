// ============================================================================
// Photos du site, désignées par une clé stable (colonne services.image_key).
// Importées statiquement : Next.js génère AVIF/WebP, tailles adaptées et flou
// de chargement. Origine et licence de chaque fichier : docs/IMAGES.md.
// ============================================================================
import type { StaticImageData } from 'next/image'
import type { ImageKey } from '@/shared/constants'
import posteDeTravail from './images/nettoyage-poste-de-travail.jpg'
import hallVitres from './images/nettoyage-hall-vitres-bureaux.jpg'
import industriel from './images/nettoyage-industriel-haute-pression.jpg'
import facade from './images/nettoyage-facade-vitree-hauteur.jpg'
import finDeChantier from './images/nettoyage-fin-de-chantier.jpg'
import pointDeSuivi from './images/point-de-suivi-prestation.jpg'

export const images: Record<ImageKey, StaticImageData> = {
  'poste-de-travail': posteDeTravail,
  'hall-vitres': hallVitres,
  'industriel-haute-pression': industriel,
  'facade-vitree': facade,
  'fin-de-chantier': finDeChantier,
  'point-de-suivi': pointDeSuivi,
}

export const imageFor = (key: string | null | undefined): StaticImageData | null =>
  key && key in images ? images[key as ImageKey] : null
