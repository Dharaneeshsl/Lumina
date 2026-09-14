import { activeUsers, engagementRate, eventCounts } from './aggregates'

import type { AnalyticsConsent, AnalyticsEventInput, AnalyticsEventName } from './types'

export interface StoredAnalyticsEvent extends AnalyticsEventInput {
  id: string
  tenantId: string | null
  receivedAt: Date
}

export interface AnalyticsRepository {
  findByIdempotencyKey(key: string): Promise<StoredAnalyticsEvent | null>
  insert(event: StoredAnalyticsEvent): Promise<void>
  list(input: {
    from: Date
    to: Date
    collegeId?: string
    names?: AnalyticsEventName[]
  }): Promise<StoredAnalyticsEvent[]>
  anonymizeUser(userId: string): Promise<number>
  deleteUser(userId: string): Promise<number>
}

const SENSITIVE = /password|token|secret|authorization|message|content|email|phone/i

export function sanitizeProperties(properties: AnalyticsEventInput['properties'] = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key]) => !SENSITIVE.test(key)),
  )
}

export function validateEvent(input: AnalyticsEventInput): AnalyticsEventInput {
  if (!input.idempotencyKey || input.idempotencyKey.length > 200) {
    throw new Error('ANALYTICS_IDEMPOTENCY_KEY_REQUIRED')
  }
  if (!input.name) throw new Error('ANALYTICS_EVENT_NAME_REQUIRED')
  return { ...input, properties: sanitizeProperties(input.properties) }
}

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async ingest(
    input: AnalyticsEventInput,
    tenantId: string | null,
  ): Promise<{ duplicate: boolean; event?: StoredAnalyticsEvent }> {
    const event = validateEvent(input)
    if ((event.consent as AnalyticsConsent | undefined) === 'DENIED') {
      return { duplicate: false }
    }

    const existing = await this.repository.findByIdempotencyKey(event.idempotencyKey)
    if (existing) return { duplicate: true, event: existing }

    const stored: StoredAnalyticsEvent = {
      ...event,
      id: crypto.randomUUID(),
      tenantId,
      receivedAt: new Date(),
    }

    try {
      await this.repository.insert(stored)
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const duplicate = await this.repository.findByIdempotencyKey(event.idempotencyKey)
        return { duplicate: true, event: duplicate ?? undefined }
      }
      throw error
    }

    return { duplicate: false, event: stored }
  }

  async dashboard(from: Date, to: Date, collegeId?: string) {
    const events = await this.repository.list({ from, to, collegeId })
    const users = activeUsers(events)
    const counts = eventCounts(events)
    const featureUsage = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      totals: {
        events: events.length,
        activeUsers: users,
        engagementRate: engagementRate(users, Math.max(users, 1)),
      },
      eventCounts: counts,
      featureUsage,
      dataQuality: {
        invalid: 0,
        duplicateRate: 0,
        freshnessSeconds: 0,
        expectedDays: Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000)),
      },
    }
  }

  async privacy(
    userId: string,
    action: 'EXPORT' | 'DELETE' | 'ANONYMIZE',
    from = new Date(0),
    to = new Date(),
  ) {
    if (action === 'EXPORT') {
      const events = await this.repository.list({ from, to })
      return events.filter((event) => event.actor?.userId === userId)
    }
    if (action === 'DELETE') {
      return { affected: await this.repository.deleteUser(userId) }
    }
    return { affected: await this.repository.anonymizeUser(userId) }
  }
}
