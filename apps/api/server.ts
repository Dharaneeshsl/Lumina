import '@lumina/env'

import { startCronJobs } from './cron/index.ts'
import chatRoutes from './modules/chat/chat.router.ts'
import friendsRouter from './modules/friends/friends.router.ts'
import leaderboardRouter from './modules/leaderboard/leaderboard.router.ts'
import leetcodeRouter from './modules/leetcode/leetcode.router.ts'
import postsRouter from './modules/posts/posts.router.ts'
import { profileRouter } from './modules/profile/profile.router.ts'

import '../../workers/leetcode/src/index.ts'

import { auth } from '@lumina/auth'
import { MSG_OK } from '@lumina/constants'
import {
  getMetricsContentType,
  getMetricsText,
  httpLoggerMiddleware,
  logger,
} from '@lumina/observability'
import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import express from 'express'

import type { NextFunction, Request, Response } from 'express'

const app = express()

const PORT = process.env.SERVER_PORT

app.use(httpLoggerMiddleware('api'))
app.use(express.json())

// CSRF origin validation middleware for state-changing requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
  if (isStateChanging) {
    const origin = req.headers.origin || req.headers.referer
    const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
    if (origin && !origin.startsWith(allowedOrigin) && !origin.startsWith('http://localhost:')) {
      return res.status(403).json({ message: 'CSRF protection: Invalid request origin' })
    }
  }
  next()
})

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
)

app.all('/api/auth/*path', toNodeHandler(auth))
app.use('/api/profile', profileRouter)
app.use('/api/friends', friendsRouter)
app.use('/api/posts', postsRouter)
app.use('/api/chat', chatRoutes)
app.use('/api/leaderboard', leaderboardRouter)
app.use('/api/leetcode', leetcodeRouter)

app.get('/ok', (req: Request, res: Response) => {
  res.status(200).json({ message: MSG_OK })
})

app.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await getMetricsText()
    res.setHeader('Content-Type', getMetricsContentType())
    res.status(200).send(metrics)
  } catch (error) {
    logger.error('Failed to generate Prometheus metrics', { metadata: { error: String(error) } })
    res.status(500).send('Failed to generate metrics')
  }
})

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
  startCronJobs().catch((error) => {
    logger.error('[cron] Failed to start cron jobs', { metadata: { error: String(error) } })
  })
})
