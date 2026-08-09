import express from 'express'
import { toNodeHandler } from 'better-auth/node'
import { auth } from '@auth/index'
import { profileRouter } from '@profile/profile.router'

export function createTestApp() {
  const app = express()

  app.use(express.json())

  app.all('/api/auth/*path', toNodeHandler(auth))
  app.use('/api/profile', profileRouter)

  app.get('/ok', (_req, res) => {
    res.status(200).json({ message: 'OK' })
  })

  return app
}
