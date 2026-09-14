import type { AnalyticsRepository, StoredAnalyticsEvent } from '@lumina/analytics'

export class MemoryAnalyticsRepository implements AnalyticsRepository {
  private readonly events: StoredAnalyticsEvent[] = []

  async findByIdempotencyKey(key: string) {
    return this.events.find(event => event.idempotencyKey === key) ?? null
  }
  async insert(event: StoredAnalyticsEvent) { this.events.push(event) }
  async list(input: { from: Date; to: Date; collegeId?: string }) {
    return this.events.filter(event => {
      const occurred = new Date(event.occurredAt ?? event.receivedAt)
      return occurred >= input.from && occurred <= input.to &&
        (!input.collegeId || event.actor?.collegeId === input.collegeId)
    })
  }
  async anonymizeUser(userId: string) {
    let affected = 0
    for (const event of this.events) if (event.actor?.userId === userId) {
      event.actor = { anonymousId: 'deleted-user', collegeId: event.actor.collegeId }
      affected++
    }
    return affected
  }
  async deleteUser(userId: string) {
    const before = this.events.length
    for (let i = this.events.length - 1; i >= 0; i--) if (this.events[i].actor?.userId === userId) this.events.splice(i, 1)
    return before - this.events.length
  }
}
export const analyticsStore = new MemoryAnalyticsRepository()