import { AsyncLocalStorage } from 'node:async_hooks'
import { randomBytes, randomUUID } from 'node:crypto'

export interface CorrelationStore {
  requestId: string
  traceId: string
}

const correlationStorage = new AsyncLocalStorage<CorrelationStore>()

export function generateCorrelationContext(
  existingRequestId?: string,
  existingTraceId?: string
): CorrelationStore {
  const requestId = existingRequestId || randomUUID()
  const traceId = existingTraceId || randomBytes(16).toString('hex')
  return { requestId, traceId }
}

export function runWithCorrelation<T>(store: CorrelationStore, fn: () => T): T {
  return correlationStorage.run(store, fn)
}

export function getCorrelationContext(): CorrelationStore | undefined {
  return correlationStorage.getStore()
}
