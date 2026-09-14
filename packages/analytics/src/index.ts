export * from './types'
export * from './aggregates'

import type { AnalyticsEventInput } from './types'

export interface AnalyticsTransport {
  send(events: AnalyticsEventInput[]): Promise<void>
}

/** Typed, consent-aware product analytics client. */
export class AnalyticsClient {
  constructor(private readonly transport: AnalyticsTransport) {}

  async track(event: AnalyticsEventInput): Promise<void> {
    if (!event.idempotencyKey) throw new Error('ANALYTICS_IDEMPOTENCY_KEY_REQUIRED')
    if (event.consent === 'DENIED') return
    await this.transport.send([event])
  }

  async trackMany(events: AnalyticsEventInput[]): Promise<void> {
    const accepted = events.filter((event) => event.consent !== 'DENIED')
    if (accepted.some((event) => !event.idempotencyKey)) {
      throw new Error('ANALYTICS_IDEMPOTENCY_KEY_REQUIRED')
    }
    if (accepted.length) await this.transport.send(accepted)
  }
}

export function createAnalyticsClient(transport: AnalyticsTransport) {
  return new AnalyticsClient(transport)
}

export const analytics = {
  name: '@lumina/analytics' as const,
  version: 1 as const,
}