import { prisma } from "@repo/database"

export async function findByUserId(userId: string) {
  return prisma.profile.findUnique({
    where: {
      userId,
    },
  });
}

export async function findByUsername(username: string) {
  return prisma.profile.findFirst({
    where: {
      user: {
        username,
      },
    },
    include: {
      user: true,
    },
  });
}

export async function updateProfile(
  userId: string,
  data: any
) {
  return prisma.profile.upsert({
    where: {
      userId,
    },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}