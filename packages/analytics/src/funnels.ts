import type { AnalyticsEventName } from './types'
export interface FunnelResult { step: AnalyticsEventName; users: number; conversion: number }
export function buildFunnel(steps: AnalyticsEventName[], events: Array<{ name: AnalyticsEventName; actor?: { userId?: string } }>): FunnelResult[] {
  const first = new Set(events.filter(e => e.name === steps[0]).map(e => e.actor?.userId).filter(Boolean)).size
  return steps.map((step) => {
    const users = new Set(events.filter(e => e.name === step).map(e => e.actor?.userId).filter(Boolean)).size
    return { step, users, conversion: first ? users / first : 0 }
  })
}