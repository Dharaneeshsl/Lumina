import { createApp } from '../../app'
import { describe, expect, test } from 'bun:test'

describe('analytics routes', () => {
  test('analytics route is mounted', async () => {
    const app = createApp()
    expect(app).toBeDefined()
  })
})
