import { requireAuth } from '../../middleware.ts'
import * as videoController from './video.handler.ts'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'

const router = Router()

// Security rate limiter for video token generation (max 30 requests / 15 minutes)
const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many video token requests, please try again later.' },
})

// Security rate limiter for call creation (max 20 calls / 15 minutes)
const callLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many call creation attempts, please try again later.' },
})

router.post('/token', requireAuth, tokenLimiter, videoController.getVideoToken as any)
router.post('/calls', requireAuth, callLimiter, videoController.createCall as any)
router.get('/calls/history', requireAuth, videoController.getCallHistory as any)
router.get('/calls/:callId', requireAuth, videoController.getCallDetails as any)
router.post('/calls/:callId/join', requireAuth, videoController.joinCall as any)
router.post('/calls/:callId/respond', requireAuth, videoController.respondToInvite as any)
router.post('/calls/:callId/end', requireAuth, videoController.endCall as any)

export default router
