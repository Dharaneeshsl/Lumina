import {
  canChangeClubMemberRole,
  canManageClub,
  canRemoveClubMember,
  hasMinClubRole,
} from '../../apps/api/src/api/service'
import { describe, expect, test } from 'vitest'

describe('Club RBAC', () => {
  test('Secretary, President, and Faculty can manage the club', () => {
    expect(canManageClub('PRESIDENT')).toBe(true)
    expect(canManageClub('FACULTY')).toBe(true)
    expect(canManageClub('SECRETARY')).toBe(true)
    expect(canManageClub('CORE_MEMBER')).toBe(false)
    expect(canManageClub('MEMBER')).toBe(false)
  })

  test('role hierarchy checks', () => {
    expect(hasMinClubRole('PRESIDENT', 'SECRETARY')).toBe(true)
    expect(hasMinClubRole('SECRETARY', 'CORE_MEMBER')).toBe(true)
    expect(hasMinClubRole('MEMBER', 'CORE_MEMBER')).toBe(false)
  })

  test('role change rules', () => {
    expect(canChangeClubMemberRole('PRESIDENT', 'SECRETARY')).toBe(true)
    expect(canChangeClubMemberRole('SECRETARY', 'MEMBER')).toBe(true)
    expect(canChangeClubMemberRole('SECRETARY', 'PRESIDENT')).toBe(false)
    expect(canChangeClubMemberRole('MEMBER', 'MEMBER')).toBe(false)
  })

  test('member removal rules', () => {
    expect(canRemoveClubMember('PRESIDENT', 'SECRETARY', false)).toBe(true)
    expect(canRemoveClubMember('MEMBER', 'MEMBER', true)).toBe(true)
    expect(canRemoveClubMember('MEMBER', 'CORE_MEMBER', false)).toBe(false)
  })
})
