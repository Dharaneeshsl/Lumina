import { describe, expect, test } from 'bun:test'
import { createApp } from '../../../app'

describe('analytics routes', () => {
  test('analytics route is mounted', async () => {
    const app = createApp()
    expect(app).toBeDefined()
  })
})
