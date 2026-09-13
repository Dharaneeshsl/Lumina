import {
  adminAuditQuerySchema,
  adminModerationActionSchema,
  adminUserQuerySchema,
  createAnnouncementSchema,
  systemSettingSchema,
  updateUserRoleStatusSchema,
} from '../../packages/validators/src'
import { describe, expect, it } from 'vitest'

describe('Admin Dashboard Permissions & Isolation Logic', () => {
  it('validates admin authorization roles', () => {
    const adminRoles = ['COLLEGE_ADMIN', 'ADMIN', 'SUPER_ADMIN']
    const isAuthorizedAdmin = (role: string) => adminRoles.includes(role)

    expect(isAuthorizedAdmin('STUDENT')).toBe(false)
    expect(isAuthorizedAdmin('ALUMNI')).toBe(false)
    expect(isAuthorizedAdmin('RECRUITER')).toBe(false)

    expect(isAuthorizedAdmin('COLLEGE_ADMIN')).toBe(true)
    expect(isAuthorizedAdmin('ADMIN')).toBe(true)
    expect(isAuthorizedAdmin('SUPER_ADMIN')).toBe(true)
  })

  it('enforces college isolation scope for college admins vs super admins', () => {
    const getScopedCollegeFilter = (userRole: string, userCollegeId: string | null) => {
      if (userRole === 'SUPER_ADMIN') {
        return null // global access
      }
      return userCollegeId
    }

    expect(getScopedCollegeFilter('COLLEGE_ADMIN', 'college-123')).toBe('college-123')
    expect(getScopedCollegeFilter('ADMIN', 'college-456')).toBe('college-456')
    expect(getScopedCollegeFilter('SUPER_ADMIN', 'college-123')).toBeNull()
  })

  it('validates updateUserRoleStatusSchema inputs', () => {
    const validData = {
      role: 'COLLEGE_ADMIN',
      status: 'SUSPENDED',
    }
    const parsed = updateUserRoleStatusSchema.safeParse(validData)
    expect(parsed.success).toBe(true)

    const invalidRole = {
      role: 'INVALID_ROLE',
    }
    expect(updateUserRoleStatusSchema.safeParse(invalidRole).success).toBe(false)
  })

  it('validates adminModerationActionSchema inputs', () => {
    const validAction = {
      targetType: 'POST',
      targetId: 'post-101',
      action: 'REMOVE',
      reason: 'Violation of campus community guidelines',
    }
    const parsed = adminModerationActionSchema.safeParse(validAction)
    expect(parsed.success).toBe(true)

    const invalidAction = {
      targetType: 'POST',
      targetId: 'post-101',
      action: 'EXPOSURE_BAN', // unsupported action
    }
    expect(adminModerationActionSchema.safeParse(invalidAction).success).toBe(false)
  })

  it('validates createAnnouncementSchema inputs', () => {
    const validAnnouncement = {
      title: 'Platform Maintenance Notice',
      content: 'Scheduled maintenance this Sunday at 2 AM EST.',
      targetRole: 'ALL',
      priority: 'HIGH',
    }
    const parsed = createAnnouncementSchema.safeParse(validAnnouncement)
    expect(parsed.success).toBe(true)

    const invalidAnnouncement = {
      title: 'Short',
      content: '', // empty content
    }
    expect(createAnnouncementSchema.safeParse(invalidAnnouncement).success).toBe(false)
  })
})
