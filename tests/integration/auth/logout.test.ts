import { createTestApp } from '../helpers/app'
import {
  buildCookieHeader,
  clearCapturedEmails,
  getCookieValue,
  getSetCookieHeader,
  signOut,
  signUpWithEmail,
} from '../helpers/auth'
import {
  clearDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
  prepareTestDatabase,
  setTestDatabaseUrl,
} from '../helpers/database'
import { generateRandomUser } from '../helpers/factories'
import { prisma } from '@db/client'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

describe('Auth | sign out', () => {
  const app = createTestApp()

  beforeAll(() => {
    setTestDatabaseUrl()
    return prepareTestDatabase().then(() => connectTestDatabase())
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  afterEach(async () => {
    await clearDatabase()
    clearCapturedEmails()
  })

  it('ends the current session and clears the cookie', async () => {
    const credentials = generateRandomUser({ email: 'logout.success@example.test' })
    const signupResponse = await signUpWithEmail(app, credentials)
    const setCookie = getSetCookieHeader(signupResponse)
    const sessionCookie = buildCookieHeader(setCookie)

    const sessionBeforeLogout = await prisma.session.findFirst({
      where: {
        user: { email: credentials.email },
      },
    })

    expect(sessionBeforeLogout).toBeTruthy()
    expect(getCookieValue(setCookie)).toBeTruthy()

    const response = await signOut(app, sessionCookie ?? undefined)

    expect(response.status).toBe(200)
    expect(getSetCookieHeader(response).join(';')).toContain('better-auth.session_token=')
    expect(
      await prisma.session.findFirst({ where: { userId: sessionBeforeLogout!.userId } })
    ).toBeNull()
  })

  it('rejects logout without an authenticated session', async () => {
    const response = await signOut(app)

    expect([401, 403]).toContain(response.status)
  })
})
