import type { Claim } from '@/shared/types/content'

/** Une affirmation commerciale n'est utilisée que si GAM CLEAN l'a confirmée (back-office). */
export const isConfirmed = (claims: Claim[], key: string) => claims.some((c) => c.key === key && c.confirmed)

/** Affirmations confirmées, hors « devis gratuit » (déjà mis en avant ailleurs). */
export const confirmedExtras = (claims: Claim[]) => claims.filter((c) => c.confirmed && c.key !== 'freeQuote')
