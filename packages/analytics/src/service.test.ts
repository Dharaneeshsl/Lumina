import { describe, expect, test } from 'bun:test'
import { AnalyticsService, type AnalyticsRepository, type StoredAnalyticsEvent } from './service'

class Repo implements AnalyticsRepository {
  events: StoredAnalyticsEvent[] = []
  async findByIdempotencyKey(key: string) { return this.events.find(e => e.idempotencyKey === key) ?? null }
  async insert(event: StoredAnalyticsEvent) { this.events.push(event) }
  async list(input: { from: Date; to: Date; collegeId?: string }) { return this.events.filter(e => (!input.collegeId || e.actor?.collegeId === input.collegeId)) }
  async anonymizeUser(userId: string) { let n=0; for(const e of this.events) if(e.actor?.userId===userId){e.actor={anonymousId:'deleted-user'};n++} return n }
  async deleteUser(userId: string) { const before=this.events.length; this.events=this.events.filter(e=>e.actor?.userId!==userId); return before-this.events.length }
}

const input={name:'user_logged_in' as const,idempotencyKey:'key-1',actor:{userId:'u1',collegeId:'c1'}}

describe('AnalyticsService',()=>{
  test('deduplicates idempotency keys',async()=>{
    const service=new AnalyticsService(new Repo())
    expect((await service.ingest(input,'c1')).duplicate).toBe(false)
    expect((await service.ingest(input,'c1')).duplicate).toBe(true)
  })
  test('drops denied consent',async()=>{
    const repo=new Repo(); const service=new AnalyticsService(repo)
    await service.ingest({...input,consent:'DENIED'},'c1')
    expect(repo.events).toHaveLength(0)
  })
  test('removes sensitive properties',async()=>{
    const repo=new Repo(); const service=new AnalyticsService(repo)
    await service.ingest({...input,idempotencyKey:'key-2',properties:{password:'x',screen:'home'}},'c1')
    expect(repo.events[0].properties).toEqual({screen:'home'})
  })
})