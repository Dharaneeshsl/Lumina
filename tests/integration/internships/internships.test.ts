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

describe('Internships | Feature Endpoints', () => {
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

  it('handles company creation, internship posting, student applying, status update, and withdrawal', async () => {
    const college = await createCollege({ name: 'Lumina Tech Institute' })

    const { user: recruiter, cookie: recruiterCookie } = await createTestUserWithSession({
      collegeId: college.id,
      name: 'Recruiter User',
    })

    const { user: student, cookie: studentCookie } = await createTestUserWithSession({
      collegeId: college.id,
      name: 'Student Applicant',
    })

    const request = (await import('supertest')).default

    // 1. Create Company
    const companyRes = await request(app)
      .post('/api/v1/internships/companies')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', recruiterCookie)
      .set('x-test-user-id', recruiter.id)
      .send({
        name: 'Nexus Cloud Corp',
        website: 'https://nexuscloud.example.com',
        description: 'Leading cloud native platform provider',
        industry: 'Cloud Computing',
        location: 'Seattle, WA',
      })

    expect(companyRes.status).toBe(201)
    expect(companyRes.body.name).toBe('Nexus Cloud Corp')
    const companyId = companyRes.body.id

    // 2. List Companies
    const listCompRes = await request(app)
      .get('/api/v1/internships/companies')
      .set('Cookie', recruiterCookie)
      .set('x-test-user-id', recruiter.id)

    expect(listCompRes.status).toBe(200)
    expect(listCompRes.body.length).toBeGreaterThanOrEqual(1)

    // 3. Post Internship
    const postRes = await request(app)
      .post('/api/v1/internships')
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', recruiterCookie)
      .set('x-test-user-id', recruiter.id)
      .send({
        companyId,
        title: 'Backend Engineering Intern',
        description: 'Build microservices and database engines',
        location: 'Remote',
        stipend: 4000,
        type: 'FULL_TIME',
        mode: 'REMOTE',
        status: 'PUBLISHED',
        skills: ['Node.js', 'PostgreSQL'],
      })

    expect(postRes.status).toBe(201)
    expect(postRes.body.title).toBe('Backend Engineering Intern')
    const internshipId = postRes.body.id

    // 4. List Internships
    const listRes = await request(app).get('/api/v1/internships').query({ q: 'Backend' })

    expect(listRes.status).toBe(200)
    expect(listRes.body.items.length).toBeGreaterThanOrEqual(1)

    // 5. Apply for Internship as Student
    const applyRes = await request(app)
      .post(`/api/v1/internships/${internshipId}/apply`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', studentCookie)
      .set('x-test-user-id', student.id)
      .send({
        resumeUrl: 'https://example.com/student_resume.pdf',
        coverLetter: 'Strong background in Node.js and PostgreSQL database optimizations.',
      })

    expect(applyRes.status).toBe(201)
    expect(applyRes.body.status).toBe('APPLIED')
    const applicationId = applyRes.body.id

    // 6. Duplicate application fails
    const dupRes = await request(app)
      .post(`/api/v1/internships/${internshipId}/apply`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', studentCookie)
      .set('x-test-user-id', student.id)
      .send({
        resumeUrl: 'https://example.com/student_resume.pdf',
      })

    expect(dupRes.status).toBe(409)

    // 7. Get My Applications as Student
    const myAppRes = await request(app)
      .get('/api/v1/internships/my-applications')
      .set('Cookie', studentCookie)
      .set('x-test-user-id', student.id)

    expect(myAppRes.status).toBe(200)
    expect(myAppRes.body.length).toBe(1)

    // 8. Reviewer lists applications for the internship
    const revListRes = await request(app)
      .get(`/api/v1/internships/${internshipId}/applications`)
      .set('Cookie', recruiterCookie)
      .set('x-test-user-id', recruiter.id)

    expect(revListRes.status).toBe(200)
    expect(revListRes.body.length).toBe(1)

    // 9. Reviewer updates status to SHORTLISTED
    const statusRes = await request(app)
      .patch(`/api/v1/internships/applications/${applicationId}/status`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', recruiterCookie)
      .set('x-test-user-id', recruiter.id)
      .send({
        status: 'SHORTLISTED',
        notes: 'Invited to technical interview round 1.',
      })

    expect(statusRes.status).toBe(200)
    expect(statusRes.body.status).toBe('SHORTLISTED')

    // 10. Student withdraws application
    const withdrawRes = await request(app)
      .post(`/api/v1/internships/${internshipId}/withdraw`)
      .set('Origin', process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .set('Cookie', studentCookie)
      .set('x-test-user-id', student.id)

    expect(withdrawRes.status).toBe(200)
    expect(withdrawRes.body.status).toBe('WITHDRAWN')
  }, 30000)
})
