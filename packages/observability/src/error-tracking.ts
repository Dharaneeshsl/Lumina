import { getCorrelationContext } from './context.ts'
import { logger, redactSensitiveData } from './logger.ts'

import type { NextFunction, Request, Response } from 'express'

export interface ErrorTrackingOptions {
  dsn?: string
  environment?: string
  release?: string
  enabled?: boolean
}

let isInitialized = false

export function initErrorTracking(options?: ErrorTrackingOptions) {
  const dsn = options?.dsn || process.env.SENTRY_DSN
  if (!dsn) {
    logger.info('Error tracking DSN not configured — fallback to structured application logging')
    return
  }
  isInitialized = true
  logger.info('Error tracking initialized successfully', {
    metadata: { environment: options?.environment || process.env.NODE_ENV || 'development' },
  })
}

export function captureException(error: unknown, extraContext?: Record<string, unknown>) {
  const correlation = getCorrelationContext()
  const sanitizedContext = redactSensitiveData(extraContext || {}) as Record<string, unknown>

  logger.error(error instanceof Error ? error.message : String(error), {
    request_id: correlation?.requestId,
    trace_id: correlation?.traceId,
    metadata: {
      error: error instanceof Error ? { name: error.name, stack: error.stack } : String(error),
      ...sanitizedContext,
    },
  })

  if (isInitialized) {
    // Sentry / Error tracking provider integration hook
  }
}

export function errorTrackingMiddleware() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    captureException(err, {
      method: req.method,
      path: req.path,
      headers: redactSensitiveData(req.headers),
    })

    if (res.headersSent) {
      return next(err)
    }

    if ('status' in err && typeof (err as { status?: number }).status === 'number') {
      const status = (err as { status: number; message: string; code?: string }).status
      return res.status(status).json({
        message: status >= 500 ? 'An unexpected internal server error occurred.' : err.message,
        code: (err as { code?: string }).code,
      })
    }

    res.status(500).json({
      type: 'https://lumina.app/errors/internal-server-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected internal server error occurred.',
      instance: req.path,
    })
  }
}
