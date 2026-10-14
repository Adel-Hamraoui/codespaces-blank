// ============================================================================
// Limitation de débit, en mémoire.
// « Au mieux » : sur Vercel, chaque instance serverless a sa propre mémoire.
// C'est un garde-fou contre les envois en rafale, pas une protection absolue.
// Pour aller plus loin : règle de limitation dans le pare-feu Vercel (voir README).
// ============================================================================
const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 5
const hits = new Map<string, number[]>()

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
  }
  return recent.length > MAX_REQUESTS
}
