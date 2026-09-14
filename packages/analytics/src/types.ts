export const ANALYTICS_EVENT_NAMES = [
  'user_signed_up',
  'user_logged_in',
  'profile_viewed',
  'post_created',
  'post_liked',
  'club_joined',
  'club_event_created',
  'club_event_registered',
  'internship_viewed',
  'internship_applied',
  'message_sent',
  'notification_opened',
  'feature_used',
] as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number]
export type AnalyticsConsent = 'GRANTED' | 'DENIED' | 'UNKNOWN'

export interface AnalyticsActor {
  userId?: string
  anonymousId?: string
  collegeId?: string
}

export interface AnalyticsEventInput {
  name: AnalyticsEventName
  occurredAt?: string
  properties?: Record<string, string | number | boolean | null>
  idempotencyKey: string
  actor?: AnalyticsActor
  consent?: AnalyticsConsent
}

export interface AnalyticsEvent extends AnalyticsEventInput {
  id: string
  tenantId: string | null
  receivedAt: string
}

export interface AnalyticsQuery {
  from?: string
  to?: string
  collegeId?: string
  event?: AnalyticsEventName
}
