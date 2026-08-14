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
import { httpLoggerMiddleware, logger } from '@lumina/observability'
import { toNodeHandler } from 'better-auth/node'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

import type { Request, Response } from 'express'

const app = express()

const PORT = process.env.SERVER_PORT

app.use(httpLoggerMiddleware('api'))
app.use(express.json())
app.use(cookieParser())

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

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
  startCronJobs().catch((error) => {
    logger.error('[cron] Failed to start cron jobs', { metadata: { error: String(error) } })
  })
})
