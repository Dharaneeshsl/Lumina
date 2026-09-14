import { AnalyticsService, ANALYTICS_EVENT_NAMES, type AnalyticsEventInput } from '@lumina/analytics'
import { analyticsStore } from './store'
import { Router } from 'express'
import { requireAuth } from '../../middleware'
import rateLimit from 'express-rate-limit'

const service = new AnalyticsService(analyticsStore)
const router = Router()
const limiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false })

function dates(query: Record<string, unknown>) {
  const to = query.to ? new Date(String(query.to)) : new Date()
  const from = query.from ? new Date(String(query.from)) : new Date(to.getTime() - 30 * 86400000)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) throw new Error('INVALID_DATE_RANGE')
  return { from, to }
}

router.post('/events', requireAuth, limiter, async (req, res) => {
  try {
    const body = req.body as AnalyticsEventInput
    if (!ANALYTICS_EVENT_NAMES.includes(body.name)) return res.status(400).json({ error: 'UNKNOWN_ANALYTICS_EVENT' })
    const result = await service.ingest(body, body.actor?.collegeId ?? null)
    return res.status(result.duplicate ? 200 : 202).json({ status: result.duplicate ? 'duplicate' : 'accepted', eventId: result.event?.id })
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'ANALYTICS_EVENT_REJECTED' })
  }
})

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const { from, to } = dates(req.query)
    return res.json(await service.dashboard(from, to, typeof req.query.collegeId === 'string' ? req.query.collegeId : undefined))
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'ANALYTICS_QUERY_REJECTED' })
  }
})

router.get('/export', requireAuth, async (req, res) => {
  try {
    const { from, to } = dates(req.query)
    const data = await service.dashboard(from, to, typeof req.query.collegeId === 'string' ? req.query.collegeId : undefined)
    res.setHeader('Content-Disposition', 'attachment; filename="lumina-analytics.json"')
    return res.json(data)
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'ANALYTICS_EXPORT_REJECTED' })
  }
})

router.post('/privacy/:userId', requireAuth, async (req, res) => {
  const action = req.body?.action
  if (!['EXPORT', 'DELETE', 'ANONYMIZE'].includes(action)) return res.status(400).json({ error: 'INVALID_PRIVACY_ACTION' })
  return res.json(await service.privacy(req.params.userId, action))
})

export default router