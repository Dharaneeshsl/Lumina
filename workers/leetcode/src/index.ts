import { redis } from '../../../apps/api/config/config.redis'
import { runLeetcodeDailySync } from '../../../apps/api/cron/leetcode.daily-sync.job'
import { syncProfileById } from '../../../apps/api/modules/leetcode/leetcode.sync.service'
import {
  LEETCODE_JOB_DAILY_SYNC,
  LEETCODE_JOB_SYNC_PROFILE,
  LEETCODE_QUEUE_NAME,
} from '../../../apps/api/config/leetcode.queue'
import { Worker } from 'bullmq'

export const leetcodeWorker = new Worker(
  LEETCODE_QUEUE_NAME,
  async (job) => {
    if (job.name === LEETCODE_JOB_DAILY_SYNC) {
      return runLeetcodeDailySync()
    }

    if (job.name === LEETCODE_JOB_SYNC_PROFILE) {
      const { profileId } = job.data as { profileId: string }
      console.log(`[leetcode-worker] Processing sync for profile ${profileId}`)
      return syncProfileById(profileId)
    }

    throw new Error(`UNKNOWN_JOB_TYPE:${job.name}`)
  },
  {
    connection: redis,
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 60_000,
    },
  }
)

leetcodeWorker.on('completed', (job) => {
  console.log(`[leetcode-worker] Job ${job.id} (${job.name}) completed`)
})

leetcodeWorker.on('failed', (job, error) => {
  console.error(`[leetcode-worker] Job ${job?.id} (${job?.name}) failed:`, error)
})
