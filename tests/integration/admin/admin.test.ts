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

describe('Admin Dashboard | Feature Endpoints', () => {
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

  it('provides admin metrics, user management, moderation, audit logging, settings, and announcements', async () => {
    const college = await createCollege({ name: 'Lumina Imperial Institute' })

    // Create Super Admin user
    const { user: adminUser, cookie: adminCookie } = await createTestUserWithSession({
      collegeId: college.id,
      name: 'Global Administrator',
    })

    // Upgrade user to SUPER_ADMIN in DB
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { role: 'SUPER_ADMIN' },
    })

    // Create target user for management
    const targetUser = await prisma.user.create({
      data: {
        email: 'student.target@lumina.edu',
        name: 'Target Student',
        role: 'STUDENT',
        collegeId: college.id,
      },
    })

    const request = (await import('supertest')).default

    // 1. Get Admin Dashboard Summary Metrics
    const metricsRes = await request(app)
      .get('/api/v1/admin/summary')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)

    expect(metricsRes.status).toBe(200)
    expect(metricsRes.body).toHaveProperty('totalUsers')
    expect(metricsRes.body).toHaveProperty('totalColleges')
    expect(metricsRes.body).toHaveProperty('pendingVerifications')
    expect(metricsRes.body).toHaveProperty('openReports')

    // 2. List & Search Admin Users
    const usersRes = await request(app)
      .get('/api/v1/admin/users?q=Target')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)

    expect(usersRes.status).toBe(200)
    const userList = Array.isArray(usersRes.body) ? usersRes.body : usersRes.body.users
    expect(userList.length).toBeGreaterThanOrEqual(1)
    expect(userList[0].id).toBe(targetUser.id)

    // 3. Update Target User Role and Status
    const updateRoleRes = await request(app)
      .patch(`/api/v1/admin/users/${targetUser.id}`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)
      .send({
        role: 'COLLEGE_ADMIN',
        status: 'ACTIVE',
      })

    expect(updateRoleRes.status).toBe(200)
    expect(updateRoleRes.body.role).toBe('COLLEGE_ADMIN')

    // 4. List Pending Verification Queue
    const verifQueueRes = await request(app)
      .get('/api/v1/admin/verification/queue')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)

    expect(verifQueueRes.status).toBe(200)
    expect(Array.isArray(verifQueueRes.body)).toBe(true)

    // 5. List Moderation Reports Queue
    const reportsRes = await request(app)
      .get('/api/v1/admin/reports/queue')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)

    expect(reportsRes.status).toBe(200)
    expect(Array.isArray(reportsRes.body)).toBe(true)

    // 6. Apply Admin Moderation Action
    const moderationRes = await request(app)
      .post('/api/v1/admin/moderation/action')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)
      .send({
        targetType: 'POST',
        targetId: 'dummy-post-99',
        action: 'DISMISS',
        reason: 'Report reviewed and found non-violating',
      })

    expect(moderationRes.status).toBe(200)
    expect(moderationRes.body.success).toBe(true)

    // 7. Query Admin Audit Logs
    const auditRes = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)

    expect(auditRes.status).toBe(200)
    const logsList = Array.isArray(auditRes.body) ? auditRes.body : auditRes.body.logs
    expect(logsList.length).toBeGreaterThanOrEqual(1)

    // 8. Update and Get System Settings
    const setSettingRes = await request(app)
      .patch('/api/v1/admin/settings')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)
      .send({
        key: 'maintenance_mode',
        value: 'false',
        description: 'Global maintenance flag',
      })

    expect(setSettingRes.status).toBe(200)
    expect(setSettingRes.body.key).toBe('maintenance_mode')

    const getSettingsRes = await request(app)
      .get('/api/v1/admin/settings')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)

    expect(getSettingsRes.status).toBe(200)
    expect(Array.isArray(getSettingsRes.body)).toBe(true)

    // 9. Create and List System Announcements
    const createAnnounceRes = await request(app)
      .post('/api/v1/admin/announcements')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)
      .send({
        title: 'Platform System Upgrade Scheduled',
        content: 'System will undergo scheduled maintenance tonight at midnight.',
        targetRole: 'ALL',
        priority: 'HIGH',
      })

    expect(createAnnounceRes.status).toBe(201)
    expect(createAnnounceRes.body.title).toBe('Platform System Upgrade Scheduled')

    const listAnnounceRes = await request(app)
      .get('/api/v1/admin/announcements')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', adminUser.id)

    expect(listAnnounceRes.status).toBe(200)
    expect(listAnnounceRes.body.length).toBeGreaterThanOrEqual(1)
  }, 30000)

  it('rejects access for non-admin users with 403 Forbidden', async () => {
    const college = await createCollege({ name: 'Lumina State College' })
    const { user: studentUser, cookie: studentCookie } = await createTestUserWithSession({
      collegeId: college.id,
      name: 'Regular Student',
    })

    const request = (await import('supertest')).default

    const res = await request(app)
      .get('/api/v1/admin/summary')
      .set('Cookie', studentCookie)
      .set('x-test-user-id', studentUser.id)

    expect(res.status).toBe(403)
  })
})
