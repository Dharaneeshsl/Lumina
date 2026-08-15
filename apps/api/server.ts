import '@lumina/env'

import { redis } from './config/config.redis.ts'
import { startCronJobs } from './cron/index.ts'
import chatRoutes from './modules/chat/chat.router.ts'
import commentsRouter from './modules/comments/comments.router.ts'
import friendsRouter from './modules/friends/friends.router.ts'
import leaderboardRouter from './modules/leaderboard/leaderboard.router.ts'
import leetcodeRouter from './modules/leetcode/leetcode.router.ts'
import postsRouter from './modules/posts/posts.router.ts'
import { profileRouter } from './modules/profile/profile.router.ts'
import videoRouter from './modules/video/video.router.ts'

import '../../workers/leetcode/src/index.ts'

import { auth } from '@lumina/auth'
import { MSG_OK } from '@lumina/constants'
import { prisma } from '@lumina/db'
import {
  errorTrackingMiddleware,
  getMetricsContentType,
  getMetricsText,
  httpLoggerMiddleware,
  logger,
} from '@lumina/observability'
import { toNodeHandler } from 'better-auth/node'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'

import type { NextFunction, Request, Response } from 'express'

const app = express()

const PORT = process.env.SERVER_PORT

// Global rate limiting to satisfy security requirements & protect DB/API routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests from this IP, please try again later.' },
})

const readyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

app.use(globalLimiter)
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
app.use('/api/v1/video', videoRouter)
app.use('/api/v1', commentsRouter)

app.get('/ok', (req: Request, res: Response) => {
  res.status(200).json({ message: MSG_OK })
})

// Task 23: Liveness Probe - Fast process alive check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'api',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

// Task 23: Readiness Probe - Critical dependency readiness check (PostgreSQL DB & Redis)
app.get('/ready', readyLimiter, async (req: Request, res: Response) => {
  const checks: Record<string, string> = {
    database: 'unknown',
    redis: 'unknown',
  }
  let isReady = true

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch (err) {
    checks.database = `error: ${err instanceof Error ? err.message : String(err)}`
    isReady = false
  }

  try {
    const redisPong = await redis.ping()
    checks.redis = redisPong === 'PONG' ? 'ok' : `unexpected_response: ${redisPong}`
  } catch (err) {
    checks.redis = `error: ${err instanceof Error ? err.message : String(err)}`
    isReady = false
  }

  const statusCode = isReady ? 200 : 503
  res.status(statusCode).json({
    status: isReady ? 'ready' : 'unavailable',
    service: 'api',
    timestamp: new Date().toISOString(),
    checks,
  })
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

// Global Error Handling Middleware
app.use(errorTrackingMiddleware())

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
  startCronJobs().catch((error) => {
    logger.error('[cron] Failed to start cron jobs', { metadata: { error: String(error) } })
  })
})
