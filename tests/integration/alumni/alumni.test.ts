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

describe('Alumni Network | Feature Endpoints', () => {
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

  it('handles verification approval, profile setup, directory search, connection request, mentorship scheduling, and referral creation', async () => {
    const college = await createCollege({ name: 'Lumina Global University' })

    const { user: admin, cookie: adminCookie } = await createTestUserWithSession({
      collegeId: college.id,
      name: 'Admin Reviewer',
      role: 'COLLEGE_ADMIN',
    })

    const { user: alumniUser, cookie: alumniCookie } = await createTestUserWithSession({
      collegeId: college.id,
      name: 'Alumnus User',
    })

    const { user: studentUser, cookie: studentCookie } = await createTestUserWithSession({
      collegeId: college.id,
      name: 'Student User',
      role: 'STUDENT',
    })

    const request = (await import('supertest')).default

    // 1. Admin approves alumni verification
    const verifyRes = await request(app)
      .post('/api/v1/alumni/verification/approve')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', adminCookie)
      .set('x-test-user-id', admin.id)
      .send({
        userId: alumniUser.id,
        approve: true,
      })

    expect(verifyRes.status).toBe(200)
    expect(verifyRes.body.alumniVerified).toBe(true)

    // 2. Alumnus creates profile
    const profileRes = await request(app)
      .post('/api/v1/alumni/profile')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', alumniCookie)
      .set('x-test-user-id', alumniUser.id)
      .send({
        graduationYear: 2021,
        departmentName: 'Computer Science',
        company: 'Google DeepMind',
        jobTitle: 'Research Engineer',
        industry: 'Artificial Intelligence',
        location: 'San Francisco, CA',
        bio: 'Research engineer working on agentic systems.',
        isAvailableForMentorship: true,
        directoryVisible: true,
        skills: ['Python', 'PyTorch', 'LLMs'],
      })

    expect(profileRes.status).toBe(200)
    expect(profileRes.body.company).toBe('Google DeepMind')

    // 3. Search directory
    const dirRes = await request(app).get('/api/v1/alumni/directory').query({ q: 'Google' })

    expect(dirRes.status).toBe(200)
    expect(dirRes.body.length).toBeGreaterThanOrEqual(1)
    expect(dirRes.body[0].company).toBe('Google DeepMind')

    // 4. Student sends connection request
    const connRes = await request(app)
      .post('/api/v1/alumni/connections')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', studentCookie)
      .set('x-test-user-id', studentUser.id)
      .send({
        alumniId: alumniUser.id,
        message: 'Hi! Would love to connect and discuss AI research.',
      })

    expect(connRes.status).toBe(201)
    expect(connRes.body.status).toBe('PENDING')
    const connectionId = connRes.body.id

    // 5. Alumni accepts connection request
    const acceptConnRes = await request(app)
      .patch(`/api/v1/alumni/connections/${connectionId}`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', alumniCookie)
      .set('x-test-user-id', alumniUser.id)
      .send({
        status: 'ACCEPTED',
      })

    expect(acceptConnRes.status).toBe(200)
    expect(acceptConnRes.body.status).toBe('ACCEPTED')

    // 6. Student requests mentorship session
    const mentorReqRes = await request(app)
      .post('/api/v1/alumni/mentorship/sessions')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', studentCookie)
      .set('x-test-user-id', studentUser.id)
      .send({
        alumniId: alumniUser.id,
        topic: 'AI Systems Career Guidance',
        notes: 'Discussing grad school and research internships.',
        durationMinutes: 30,
      })

    expect(mentorReqRes.status).toBe(201)
    expect(mentorReqRes.body.status).toBe('REQUESTED')
    const sessionId = mentorReqRes.body.id

    // 7. Alumni schedules mentorship session
    const scheduleRes = await request(app)
      .patch(`/api/v1/alumni/mentorship/sessions/${sessionId}`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', alumniCookie)
      .set('x-test-user-id', alumniUser.id)
      .send({
        status: 'SCHEDULED',
        meetingUrl: 'https://meet.lumina.edu/test-session',
      })

    expect(scheduleRes.status).toBe(200)
    expect(scheduleRes.body.status).toBe('SCHEDULED')
    expect(scheduleRes.body.meetingUrl).toBe('https://meet.lumina.edu/test-session')

    // 8. Alumni creates referral opportunity
    const referralRes = await request(app)
      .post('/api/v1/alumni/referrals')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', alumniCookie)
      .set('x-test-user-id', alumniUser.id)
      .send({
        title: 'AI Research Fellow',
        company: 'Google DeepMind',
        location: 'San Francisco, CA',
        description: 'Referral for students with strong ML background.',
      })

    expect(referralRes.status).toBe(201)
    expect(referralRes.body.title).toBe('AI Research Fellow')

    // 9. Alumni creates alumni event
    const eventRes = await request(app)
      .post('/api/v1/alumni/events')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', alumniCookie)
      .set('x-test-user-id', alumniUser.id)
      .send({
        title: 'Alumni Tech Talk 2026',
        description: 'Keynote on Agentic AI Systems',
        eventDate: new Date(Date.now() + 86400000).toISOString(),
        virtualLink: 'https://meet.lumina.edu/tech-talk',
      })

    expect(eventRes.status).toBe(201)
    expect(eventRes.body.title).toBe('Alumni Tech Talk 2026')
  }, 30000)
})
