import { describe, expect, test } from 'bun:test'

import { activeUsers, engagementRate, eventCounts, retention } from './aggregates'
import { AnalyticsClient } from './index'

const event = {
  name: 'user_logged_in' as const,
  idempotencyKey: 'event-1',
  actor: { userId: 'user-1', collegeId: 'college-1' },
}

describe('analytics client', () => {
  test('sends accepted events', async () => {
    const sent: unknown[] = []
    const client = new AnalyticsClient({
      send: async (events) => {
        sent.push(...events)
      },
    })
    await client.track(event)
    expect(sent).toHaveLength(1)
  })

  test('drops denied consent', async () => {
    const sent: unknown[] = []
    const client = new AnalyticsClient({
      send: async (events) => {
        sent.push(...events)
      },
    })
    await client.track({ ...event, consent: 'DENIED' })
    expect(sent).toHaveLength(0)
  })

  test('requires idempotency keys', async () => {
    const client = new AnalyticsClient({ send: async () => undefined })
    await expect(client.track({ ...event, idempotencyKey: '' })).rejects.toThrow(
      'ANALYTICS_IDEMPOTENCY_KEY_REQUIRED',
    )
  })
})

describe('analytics aggregates', () => {
  test('calculates active users and event counts', () => {
    const events = [
      event,
      { ...event, idempotencyKey: 'event-2', name: 'post_created' as const },
    ]
    expect(activeUsers(events)).toBe(1)
    expect(eventCounts(events)).toEqual({ user_logged_in: 1, post_created: 1 })
  })

  test('calculates retention and engagement safely', () => {
    expect(retention(['a', 'b'], ['b'])).toBe(0.5)
    expect(retention([], ['a'])).toBe(0)
    expect(engagementRate(2, 4)).toBe(0.5)
    expect(engagementRate(1, 0)).toBe(0)
  })
})
