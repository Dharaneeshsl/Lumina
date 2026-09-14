import { prisma } from '@lumina/db'

import type { AnalyticsRepository, StoredAnalyticsEvent } from '@lumina/analytics'

function toStored(event: any): StoredAnalyticsEvent {
  return {
    id: event.id,
    name: event.name,
    idempotencyKey: event.idempotencyKey,
    occurredAt: event.occurredAt?.toISOString(),
    properties: event.properties as Record<string, string | number | boolean | null> | undefined,
    actor: {
      userId: event.userId ?? undefined,
      anonymousId: event.anonymousId ?? undefined,
      collegeId: event.collegeId ?? undefined,
    },
    consent: event.consent as any,
    tenantId: event.tenantId,
    receivedAt: event.receivedAt,
  }
}

export class PrismaAnalyticsRepository implements AnalyticsRepository {
  async findByIdempotencyKey(key: string) {
    const event = await prisma.analyticsEvent.findUnique({
      where: { idempotencyKey: key },
    })
    return event ? toStored(event) : null
  }

  async insert(event: StoredAnalyticsEvent) {
    await prisma.analyticsEvent.create({
      data: {
        id: event.id,
        name: event.name,
        idempotencyKey: event.idempotencyKey,
        userId: event.actor?.userId,
        anonymousId: event.actor?.anonymousId,
        collegeId: event.actor?.collegeId,
        tenantId: event.tenantId,
        consent: event.consent,
        properties: event.properties ?? undefined,
        occurredAt: event.occurredAt ? new Date(event.occurredAt) : undefined,
        receivedAt: event.receivedAt,
      },
    })
  }

  async list(input: { from: Date; to: Date; collegeId?: string; names?: string[] }) {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        receivedAt: { gte: input.from, lte: input.to },
        ...(input.collegeId ? { collegeId: input.collegeId } : {}),
        ...(input.names?.length ? { name: { in: input.names } } : {}),
      },
      orderBy: { receivedAt: 'asc' },
    })
    return events.map(toStored)
  }

  async anonymizeUser(userId: string) {
    const result = await prisma.analyticsEvent.updateMany({
      where: { userId },
      data: { userId: null, anonymousId: 'deleted-user' },
    })
    return result.count
  }

  async deleteUser(userId: string) {
    const result = await prisma.analyticsEvent.deleteMany({ where: { userId } })
    return result.count
  }
}

export const analyticsStore = new PrismaAnalyticsRepository()
