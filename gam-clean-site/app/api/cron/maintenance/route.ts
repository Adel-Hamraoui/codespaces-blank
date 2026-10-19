// ============================================================================
// GET /api/cron/maintenance — tâche quotidienne (Vercel Cron, voir vercel.json).
// Vercel envoie « Authorization: Bearer <CRON_SECRET> » : toute autre requête
// est refusée.
// ============================================================================
import type { NextRequest } from 'next/server'
import { config } from '@/backend/config/env'
import { runMaintenance } from '@/backend/modules/maintenance/service'
import { safeEqual } from '@/backend/security/tokens'

export async function GET(req: NextRequest) {
  const expected = config.cronSecret ? Buffer.from(`Bearer ${config.cronSecret}`) : null
  const received = Buffer.from(req.headers.get('authorization') ?? '')
  if (!expected || !safeEqual(received, expected)) {
    return Response.json({ ok: false }, { status: 401 })
  }
  const result = await runMaintenance()
  return Response.json(result, { status: result.ok ? 200 : 503 })
}
