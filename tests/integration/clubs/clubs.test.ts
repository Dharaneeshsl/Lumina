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

    const userA = await prisma.user.findUniqueOrThrow({ where: { email: userACreds.email } })
    const userB = await prisma.user.findUniqueOrThrow({ where: { email: userBCreds.email } })

    await prisma.user.update({ where: { id: userA.id }, data: { collegeId: college.id } })
    await prisma.user.update({ where: { id: userB.id }, data: { collegeId: college.id } })

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

    // 3. User B joins the club
    const joinRes = await request(app)
      .post(`/api/v1/clubs/${clubId}/join`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieB)
      .send()

    expect(joinRes.status).toBe(200)
    expect(joinRes.body.userId).toBe(userB.id)
    expect(joinRes.body.role).toBe('MEMBER')

    // 4. User A promotes User B to SECRETARY
    const promoteRes = await request(app)
      .patch(`/api/v1/clubs/${clubId}/members/${userB.id}`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send({ role: 'SECRETARY' })

    expect(promoteRes.status).toBe(200)
    expect(promoteRes.body.role).toBe('SECRETARY')

    // 5. User A archives the club
    const archiveRes = await request(app)
      .post(`/api/v1/clubs/${clubId}/archive`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', cookieA)
      .send()

    expect(archiveRes.status).toBe(200)
    expect(archiveRes.body.status).toBe('ARCHIVED')
  })
})
