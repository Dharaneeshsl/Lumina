import { Router } from 'express'
import { requireAuth } from '../../middleware'
import { manualSyncLeetCode } from './leetcode.handler'
import type { RequestHandler } from 'express'

const router = Router()

router.post('/sync', requireAuth, manualSyncLeetCode as RequestHandler)

export default router
