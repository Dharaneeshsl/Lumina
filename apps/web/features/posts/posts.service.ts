import {
  assertValidVideoDuration,
  getImageDimensions,
  getVideoMetadata,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from './post.helper'
import * as postsRepository from './posts.repository'
import { uploadFile } from '@lumina/storage'
import { prisma } from '@repo/database'

import type { CreatePostInput } from '@lumina/types'

export const createPost = async ({ userId, body, files }: CreatePostInput) => {
  const { content, visibility, anonymous = false, location } = body
  const trimmedLocation = location?.trim() ?? null

  const mediaFiles = files ?? []

  if ((!content || content.trim() === '') && mediaFiles.length === 0) {
    throw new Error('Post must contain either text or media.')
  }

  if (mediaFiles.length > 10) {
    throw new Error('Maximum 10 media files are allowed.')
  }

  const uploadedMedia = await Promise.all(
    mediaFiles.map(async (file) => {
      if (file.mimetype.startsWith('image/')) {
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          throw new Error('Each image must be 5 MB or less.')
        }

        const { width, height } = await getImageDimensions(file)
        const uploaded = await uploadFile({
          buffer: file.buffer,
          mimeType: file.mimetype,
          folder: `posts/${userId}/media`,
          fileName: file.originalname,
        })

        return {
          type: 'IMAGE',
          url: uploaded.url,
          key: uploaded.key,
          mimeType: file.mimetype,
          size: file.size,
          width,
          height,
          duration: null,
        }
      }

      if (file.mimetype.startsWith('video/')) {
        if (file.size > MAX_VIDEO_SIZE_BYTES) {
          throw new Error('Each video must be 100 MB or less.')
        }

        const { width, height, duration } = await getVideoMetadata(file.buffer)
        const validatedDuration = assertValidVideoDuration(duration)

        const uploaded = await uploadFile({
          buffer: file.buffer,
          mimeType: file.mimetype,
          folder: `posts/${userId}/media`,
          fileName: file.originalname,
        })

        return {
          type: 'VIDEO',
          url: uploaded.url,
          key: uploaded.key,
          mimeType: file.mimetype,
          size: file.size,
          width,
          height,
          duration: validatedDuration,
        }
      }

      throw new Error('Unsupported media type')
    })
  )

  return prisma.$transaction(async (tx) => {
    const post = await postsRepository.createPost(
      tx,
      userId,
      content,
      visibility,
      anonymous,
      trimmedLocation ? trimmedLocation : undefined
    )

    if (uploadedMedia.length > 0) {
      await postsRepository.createMedia(tx, post.id, uploadedMedia)
    }

    return await postsRepository.findPostById(tx, post.id)
  })
}

export const toggleLike = async (userId: string, postId: string) => {
  return prisma.$transaction(async (tx) => {
    const existing = await postsRepository.findLike(tx, userId, postId)
    if (existing) {
      await tx.like.delete({
        where: { id: existing.id },
      })

      await tx.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      })

      return {
        liked: false,
      }
    }

    await tx.like.create({
      data: {
        userId,
        postId,
      },
    })

    await tx.post.update({
      where: { id: postId },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    })

    return {
      liked: true,
    }
  })
}
export const getLikeCount = async (postId: string) => {
  return prisma.$transaction(async (tx) => {
    const count = await postsRepository.getLikeCount(tx, postId)
    return count
  })
}

export const createComment = async ({
  postId,
  userId,
  content,
  parentId,
}: {
  postId: string
  userId: string
  content: string
  parentId?: string | null
}) => {
  const post = await postsRepository.findPostWithAuthor(prisma as any, postId)

  if (!post) {
    throw new Error('POST_NOT_FOUND')
  }

  if (parentId) {
    const parentComment = await postsRepository.findCommentById(prisma as any, parentId)

    if (!parentComment) {
      throw new Error('PARENT_COMMENT_NOT_FOUND')
    }

    if (parentComment.postId !== postId) {
      throw new Error('INVALID_PARENT_COMMENT')
    }
  }

  const comment = await postsRepository.createComment({
    tx: prisma as any,
    postId,
    userId,
    content,
    parentId,
  })

  if (post.authorId !== userId) {
    await postsRepository.createCommentNotification({
      tx: prisma as any,
      postAuthorId: post.authorId as string,
    })
  }

  return comment
}

export const toggleSavePost = async ({
  postId,
  userId,
}: {
  postId: string
  userId: string
}) => {

  const post = await postsRepository.findPostById(prisma as any, postId)

  if (!post) {
    throw new Error('POST_NOT_FOUND')
  }

  const existing = await postsRepository.findSavedPost(
    prisma,
    userId,
    postId
  )

  if (existing) {
    await postsRepository.deleteSavedPost(
      prisma as any,
      userId,
      postId
    )

    return {
      saved: false,
    }
  }

  await postsRepository.createSavedPost(
    prisma,
    userId,
    postId
  )

  return {
    saved: true,
  }
}

export const getMySavedPosts = async (userId: string) => {
  return postsRepository.findSavedPostsByUser(
    prisma as any,
    userId
  )
}