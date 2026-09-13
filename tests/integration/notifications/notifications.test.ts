import { createTestApp } from '../helpers/app'
import { createTestUserWithSession } from '../helpers/auth'
import {
  clearDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
  prepareTestDatabase,
  setTestDatabaseUrl,
} from '../helpers/database'
import { createCollege } from '../helpers/factories'
import { prisma } from '@db/client'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

describe('Notifications | Feature Endpoints', () => {
  const app = createTestApp()

  beforeAll(async () => {
    setTestDatabaseUrl()
    await prepareTestDatabase()
    await connectTestDatabase()
  }, 30000)

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  afterEach(async () => {
    await clearDatabase()
  })

  it('handles notification inbox listing, unread count, mark as read, mark all as read, preferences, and device token registration', async () => {
    const college = await createCollege({ name: 'Lumina Tech University' })

    const { user, cookie } = await createTestUserWithSession({
      collegeId: college.id,
      name: 'Notification User',
    })

    const request = (await import('supertest')).default

    // Seed test notifications for user
    const notif1 = await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Application Status Updated',
        body: 'Your application for Internship #1 was updated.',
        type: 'INTERNSHIP_STATUS_CHANGE',
        read: false,
      },
    })

    const notif2 = await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Mentorship Session Scheduled',
        body: 'Your session with Dr. Lin has been scheduled.',
        type: 'MENTORSHIP_STATUS',
        read: false,
      },
    })

    // 1. Get unread count
    const unreadRes = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)

    expect(unreadRes.status).toBe(200)
    expect(unreadRes.body.unreadCount).toBe(2)

    // 2. List notifications
    const listRes = await request(app)
      .get('/api/v1/notifications')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)

    expect(listRes.status).toBe(200)
    expect(listRes.body.length).toBe(2)

    // 3. Mark one notification as read
    const markReadRes = await request(app)
      .post('/api/v1/notifications/read')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)
      .send({
        notificationIds: [notif1.id],
      })

    expect(markReadRes.status).toBe(200)

    const unreadRes2 = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)

    expect(unreadRes2.body.unreadCount).toBe(1)

    // 4. Mark all notifications as read
    const markAllRes = await request(app)
      .post('/api/v1/notifications/read-all')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)

    expect(markAllRes.status).toBe(200)

    const unreadRes3 = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)

    expect(unreadRes3.body.unreadCount).toBe(0)

    // 5. Archive a notification
    const archiveRes = await request(app)
      .patch(`/api/v1/notifications/${notif2.id}/archive`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)

    expect(archiveRes.status).toBe(200)

    // 6. Get notification preferences
    const prefRes = await request(app)
      .get('/api/v1/notifications/preferences')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)

    expect(prefRes.status).toBe(200)
    expect(prefRes.body.emailEnabled).toBe(true)

    // 7. Update notification preferences
    const updatePrefRes = await request(app)
      .patch('/api/v1/notifications/preferences')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)
      .send({
        emailEnabled: false,
        pushEnabled: true,
      })

    expect(updatePrefRes.status).toBe(200)
    expect(updatePrefRes.body.emailEnabled).toBe(false)

    // 8. Register device token
    const tokenRes = await request(app)
      .post('/api/v1/notifications/devices')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookie)
      .set('x-test-user-id', user.id)
      .send({
        token: 'web-push-test-token-12345',
        platform: 'WEB',
      })

    expect(tokenRes.status).toBe(201)
    expect(tokenRes.body.token).toBe('web-push-test-token-12345')
  }, 30000)
})
