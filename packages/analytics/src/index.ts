export const ANALYTICS_EVENT_NAMES = ['user_signed_up','user_logged_in','profile_viewed','post_created','post_liked','club_joined','club_event_created','club_event_registered','internship_viewed','internship_applied','message_sent','notification_opened','feature_used'] as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number]
export type AnalyticsConsent = 'GRANTED' | 'DENIED' | 'UNKNOWN'
export interface AnalyticsActor { userId?: string; anonymousId?: string; collegeId?: string }
export interface AnalyticsEventInput {
  name: AnalyticsEventName
  occurredAt?: string
  properties?: Record<string, string | number | boolean | null>
  idempotencyKey: string
  actor?: AnalyticsActor
  consent?: AnalyticsConsent
}
export interface AnalyticsTransport { send(events: AnalyticsEventInput[]): Promise<void> }

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
    if (accepted.some((event) => !event.idempotencyKey)) throw new Error('ANALYTICS_IDEMPOTENCY_KEY_REQUIRED')
    if (accepted.length) await this.transport.send(accepted)
  }
}
export function createAnalyticsClient(transport: AnalyticsTransport) { return new AnalyticsClient(transport) }
export const analytics = { name: '@lumina/analytics' as const, version: 1 as const }