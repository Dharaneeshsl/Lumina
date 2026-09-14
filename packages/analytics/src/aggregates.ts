import type { AnalyticsEventInput } from './types'

export interface TimedAnalyticsEvent extends AnalyticsEventInput { receivedAt?: string }
export function activeUsers(events: TimedAnalyticsEvent[]): number {
  return new Set(events.map((event) => event.actor?.userId).filter((id): id is string => Boolean(id))).size
}
export function eventCounts(events: TimedAnalyticsEvent[]): Record<string, number> {
  return events.reduce<Record<string, number>>((counts, event) => {
    counts[event.name] = (counts[event.name] ?? 0) + 1
    return counts
  }, {})
}
export function retention(cohort: string[], returning: string[]): number {
  if (!cohort.length) return 0
  const returningSet = new Set(returning)
  return cohort.filter((id) => returningSet.has(id)).length / cohort.length
}
export function engagementRate(active: number, eligible: number): number {
  return eligible > 0 ? active / eligible : 0
}