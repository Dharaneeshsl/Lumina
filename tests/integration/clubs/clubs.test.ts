import { createTestApp } from '../helpers/app'
import {
  buildCookieHeader,
  clearCapturedEmails,
  getSetCookieHeader,
  signUpWithEmail,
} from '../helpers/auth'
import {
  clearDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
  prepareTestDatabase,
  setTestDatabaseUrl,
} from '../helpers/database'
import { createCollege, generateRandomUser } from '../helpers/factories'
import { prisma } from '@db/client'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

describe('Clubs | Feature Endpoints', () => {
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
    clearCapturedEmails()
  })

  it('creates, retrieves, joins, updates, and archives a club', async () => {
    const college = await createCollege({ name: 'Lumina Tech University' })

    const userACreds = generateRandomUser({
      email: 'president@lumina.test',
      name: 'President User',
    })
    const signupA = await signUpWithEmail(app, userACreds)
    const cookieA = buildCookieHeader(getSetCookieHeader(signupA)) ?? ''

    const userBCreds = generateRandomUser({ email: 'member@lumina.test', name: 'Member User' })
    const signupB = await signUpWithEmail(app, userBCreds)
    const cookieB = buildCookieHeader(getSetCookieHeader(signupB)) ?? ''

    const userCCreds = generateRandomUser({ email: 'invitee@lumina.test', name: 'Invited User' })
    const signupC = await signUpWithEmail(app, userCCreds)
    const cookieC = buildCookieHeader(getSetCookieHeader(signupC)) ?? ''

    const userA = await prisma.user.findUniqueOrThrow({ where: { email: userACreds.email } })
    const userB = await prisma.user.findUniqueOrThrow({ where: { email: userBCreds.email } })
    const userC = await prisma.user.findUniqueOrThrow({ where: { email: userCCreds.email } })

    await prisma.user.update({ where: { id: userA.id }, data: { collegeId: college.id } })
    await prisma.user.update({ where: { id: userB.id }, data: { collegeId: college.id } })
    await prisma.user.update({ where: { id: userC.id }, data: { collegeId: college.id } })

    const request = (await import('supertest')).default

    // 1. Create Club as User A
    const createRes = await request(app)
      .post('/api/v1/clubs')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send({
        name: 'Robotics & AI Club',
        description: 'Building autonomous robots and AI algorithms.',
        category: 'TECHNOLOGY',
      })

    expect(createRes.status).toBe(201)
    expect(createRes.body.name).toBe('Robotics & AI Club')
    expect(createRes.body.category).toBe('TECHNOLOGY')
    expect(createRes.body.members[0].userId).toBe(userA.id)
    expect(createRes.body.members[0].role).toBe('PRESIDENT')

    const clubId = createRes.body.id

    // 2. List Clubs as User B
    const listRes = await request(app)
      .get('/api/v1/clubs')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieB)
      .send()

    expect(listRes.status).toBe(200)
    expect(listRes.body.clubs).toHaveLength(1)

    // 3. Get Club Details
    const getRes = await request(app)
      .get(`/api/v1/clubs/${clubId}`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieB)
      .send()

    expect(getRes.status).toBe(200)
    expect(getRes.body.name).toBe('Robotics & AI Club')

    // 4. Update Club Info as User A
    const updateRes = await request(app)
      .patch(`/api/v1/clubs/${clubId}`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send({ description: 'Building next-gen autonomous robots.' })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.description).toBe('Building next-gen autonomous robots.')

    // 5. User B joins the club
    const joinRes = await request(app)
      .post(`/api/v1/clubs/${clubId}/join`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieB)
      .send()

    expect(joinRes.status).toBe(200)
    expect(joinRes.body.userId).toBe(userB.id)
    expect(joinRes.body.role).toBe('MEMBER')

    // 6. User A promotes User B to SECRETARY
    const promoteRes = await request(app)
      .patch(`/api/v1/clubs/${clubId}/members/${userB.id}`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send({ role: 'SECRETARY' })

    expect(promoteRes.status).toBe(200)
    expect(promoteRes.body.role).toBe('SECRETARY')

    // 7. Invite User C to the club
    const inviteRes = await request(app)
      .post(`/api/v1/clubs/${clubId}/invitations`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send({ userId: userC.id, role: 'MEMBER' })

    expect(inviteRes.status).toBe(201)
    expect(inviteRes.body.status).toBe('PENDING')
    const invitationId = inviteRes.body.id

    // 8. User C accepts the invitation
    const respondRes = await request(app)
      .post(`/api/v1/clubs/invitations/${invitationId}/respond`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieC)
      .send({ accept: true })

    expect(respondRes.status).toBe(200)
    expect(respondRes.body.status).toBe('ACCEPTED')

    // 9. User A creates a Club Event
    const createEventRes = await request(app)
      .post(`/api/v1/clubs/${clubId}/events`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send({
        title: 'Robotics Hackathon 2026',
        description: '24-hour hardware & software building competition.',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 172800000).toISOString(),
        venue: 'Main Innovation Lab',
      })

    expect(createEventRes.status).toBe(201)
    expect(createEventRes.body.title).toBe('Robotics Hackathon 2026')

    // 10. List Club Events
    const listEventsRes = await request(app)
      .get(`/api/v1/clubs/${clubId}/events`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieB)
      .send()

    expect(listEventsRes.status).toBe(200)
    expect(listEventsRes.body).toHaveLength(1)

    // 11. User A creates an Announcement Post
    const createPostRes = await request(app)
      .post(`/api/v1/clubs/${clubId}/posts`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send({
        content: 'Welcome all members to the new academic year!',
        isAnnouncement: true,
      })

    expect(createPostRes.status).toBe(201)
    expect(createPostRes.body.isAnnouncement).toBe(true)

    // 12. Get Club Analytics
    const analyticsRes = await request(app)
      .get(`/api/v1/clubs/${clubId}/analytics`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send()

    expect(analyticsRes.status).toBe(200)
    expect(analyticsRes.body.totalMembers).toBe(3)
    expect(analyticsRes.body.totalEvents).toBe(1)
    expect(analyticsRes.body.totalPosts).toBe(1)

    // 13. User C leaves the club
    const leaveRes = await request(app)
      .delete(`/api/v1/clubs/${clubId}/members/${userC.id}`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieC)
      .send()

    expect(leaveRes.status).toBe(200)

    // 14. User A archives the club
    const archiveRes = await request(app)
      .post(`/api/v1/clubs/${clubId}/archive`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send()

    expect(archiveRes.status).toBe(200)
    expect(archiveRes.body.status).toBe('ARCHIVED')
  })
})
