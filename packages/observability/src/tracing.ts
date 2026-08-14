import { context, SpanStatusCode, trace } from '@opentelemetry/api'

import type { Span, Tracer } from '@opentelemetry/api'

export const tracer: Tracer = trace.getTracer('lumina', '1.0.0')

export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    if (attributes) {
      span.setAttributes(attributes)
    }
    try {
      const result = await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      })
      span.recordException(error as Error)
      throw error
    } finally {
      span.end()
    }
  })
}

export { context, trace }
