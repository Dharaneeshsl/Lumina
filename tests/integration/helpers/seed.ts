import { createCollege, createProfile, createTestUser } from './factories'
import { prisma } from '@db/client'

export async function seedDatabase() {
  const college = await createCollege()
  const user = await createTestUser({ collegeId: college.id })
  const profile = await createProfile(user.id, {
    firstName: 'Seed',
    lastName: 'User',
  })

  return {
    college,
    profile,
    user,
  }
}

export async function resetSeedData() {
  await prisma.$transaction([])
}
