import client from 'prom-client'

export const prometheusRegistry = new client.Registry()

client.collectDefaultMetrics({
  register: prometheusRegistry,
  prefix: 'lumina_',
})

export const httpRequestsTotal = new client.Counter({
  name: 'lumina_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
  registers: [prometheusRegistry],
})

export const httpRequestDurationSeconds = new client.Histogram({
  name: 'lumina_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [prometheusRegistry],
})

export const httpErrorsTotal = new client.Counter({
  name: 'lumina_http_errors_total',
  help: 'Total number of HTTP error responses (>= 400)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [prometheusRegistry],
})

export const dbQueryDurationSeconds = new client.Histogram({
  name: 'lumina_db_query_duration_seconds',
  help: 'Database query execution duration in seconds',
  labelNames: ['model', 'action'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
  registers: [prometheusRegistry],
})

export const redisOperationDurationSeconds = new client.Histogram({
  name: 'lumina_redis_operation_duration_seconds',
  help: 'Redis operation duration in seconds',
  labelNames: ['command'],
  buckets: [0.0005, 0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25],
  registers: [prometheusRegistry],
})

export const queueDepthTotal = new client.Gauge({
  name: 'lumina_queue_depth_total',
  help: 'Total depth of active BullMQ job queues',
  labelNames: ['queue'],
  registers: [prometheusRegistry],
})

export const backgroundJobFailuresTotal = new client.Counter({
  name: 'lumina_background_job_failures_total',
  help: 'Total number of failed background worker jobs',
  labelNames: ['job_name'],
  registers: [prometheusRegistry],
})

export const videoCallsTotal = new client.Counter({
  name: 'lumina_video_calls_total',
  help: 'Total number of video calls created, joined, or ended',
  labelNames: ['type', 'action'],
  registers: [prometheusRegistry],
})

export const videoCallFailuresTotal = new client.Counter({
  name: 'lumina_video_call_failures_total',
  help: 'Total number of video call failures',
  labelNames: ['reason'],
  registers: [prometheusRegistry],
})

export const videoTokensGeneratedTotal = new client.Counter({
  name: 'lumina_video_tokens_generated_total',
  help: 'Total number of Stream Video tokens generated',
  registers: [prometheusRegistry],
})

export async function getMetricsText(): Promise<string> {
  return prometheusRegistry.metrics()
}

export function getMetricsContentType(): string {
  return prometheusRegistry.contentType
}
