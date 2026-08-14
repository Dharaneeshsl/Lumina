import * as repository from './profile.repo'
import { deleteFile, uploadFile } from '@lumina/storage'

export async function getMyProfile(userId: string) {
  return repository.findByUserId(userId)
}

export async function updateMyProfile(userId: string, data: Record<string, any>) {
  if (data.dob) {
    data.dob = new Date(data.dob)
  }
  return repository.updateProfile(userId, {
    ...data,
    leetcodeUsername: data.leetcodeUsername || null,
  })
}
export async function getProfileByUsername(username: string) {
  return repository.findByUsername(username)
}
export const uploadProfilePicture = async (userId: string, file: Express.Multer.File) => {
  if (!file) {
    throw new Error('Profile picture is required.')
  }
  const user = await repository.findByUserId(userId)
  if (!user) {
    throw new Error('User not found.')
  }

  if (user.profilePictureKey) {
    await deleteFile(user.profilePictureKey)
  }
  const uploaded = await uploadFile({
    buffer: file.buffer,
    mimeType: file.mimetype,
    folder: `users/${userId}/profile`,
    fileName: file.originalname,
  })
  if (!uploaded?.url || !uploaded?.key) {
    throw new Error('Failed to upload file to S3.')
  }

  return repository.updateProfilePicture(userId, uploaded.url, uploaded.key)
}

export const deleteProfilePicture = async (userId: string) => {
  const user = await repository.findByUserId(userId)
  if (!user) {
    throw new Error('User not found.')
  }

  if (user.profilePictureKey) {
    await deleteFile(user.profilePictureKey)
  }
  return repository.removeProfilePicture(userId)
}

export const uploadCoverImage = async (userId: string, file: Express.Multer.File) => {
  if (!file) {
    throw new Error('Cover image is required.')
  }
  const user = await repository.findByUserId(userId)
  if (!user) {
    throw new Error('User not found.')
  }
  if (user.coverImageKey) {
    await deleteFile(user.coverImageKey)
  }
  const uploaded = await uploadFile({
    buffer: file.buffer,
    mimeType: file.mimetype,
    folder: `users/${userId}/cover`,
    fileName: file.originalname,
  })
  if (!uploaded?.url || !uploaded?.key) {
    throw new Error('Failed to upload file to S3.')
  }

  return repository.updateCoverImage(userId, uploaded.url, uploaded.key)
}

export const deleteCoverImage = async (userId: string) => {
  const user = await repository.findByUserId(userId)
  if (!user) {
    throw new Error('User not found.')
  }
  if (user.coverImageKey) {
    await deleteFile(user.coverImageKey)
  }
  return repository.removeCoverImage(userId)
}
