import { describe, expect, test } from 'bun:test'
import { ADMIN_FEATURES, canAccess, type AdminSession } from './index'

describe('admin dashboard contract', () => {
  test('registers all fourteen admin features', () => {
    expect(ADMIN_FEATURES).toHaveLength(14)
  })

  test('college admins are least-privilege scoped', () => {
    const session: AdminSession = { userId: 'a', role: 'COLLEGE_ADMIN', collegeId: 'c' }
    expect(canAccess(session, 'users')).toBe(true)
    expect(canAccess(session, 'settings')).toBe(false)
    expect(canAccess(session, 'colleges')).toBe(false)
  })

  test('super admins can access every feature', () => {
    const session: AdminSession = { userId: 'a', role: 'SUPER_ADMIN' }
    for (const feature of ADMIN_FEATURES) expect(canAccess(session, feature)).toBe(true)
  })
})
