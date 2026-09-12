import IORedis from 'ioredis'

import 'dotenv/config'

const store = new Map<string, string>()

function createMemoryRedis() {
  const dummy: any = {
    async ping() {
      return 'PONG'
    },
    async get(key: string) {
      return store.get(key) ?? null
    },
    async set(key: string, val: string) {
      store.set(key, String(val))
      return 'OK'
    },
    async del(key: string) {
      return store.delete(key) ? 1 : 0
    },
    async exists(key: string) {
      return store.has(key) ? 1 : 0
    },
    async ttl() {
      return -1
    },
    async zadd() {
      return 1
    },
    async zrem() {
      return 1
    },
    async zcard() {
      return store.size
    },
    async zrevrank() {
      return 0
    },
    async zscore() {
      return '0'
    },
    async zrevrange() {
      return []
    },
    pipeline() {
      return {
        zadd() {
          return this
        },
        zrem() {
          return this
        },
        async exec() {
          return []
        },
      }
    },
    on() {
      return this
    },
  }

  return dummy
}

export const redis =
  process.env.NODE_ENV === 'test' || process.env.MOCK_REDIS === 'true'
    ? createMemoryRedis()
    : new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
        lazyConnect: true,
      })

if (typeof redis.on === 'function') {
  redis.on('error', () => {
    // Prevent uncaught connection errors when Redis server is offline
  })
}
