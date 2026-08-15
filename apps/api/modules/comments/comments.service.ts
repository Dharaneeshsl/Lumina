import {
  createCommentRecord,
  createMentionsRepo,
  createReportRepo,
  findCommentById,
  findPostById,
  getCommentsForPostRepo,
  removeReactionRepo,
  softDeleteCommentRepo,
  togglePinCommentRepo,
  toggleReactionRepo,
  updateCommentContentRepo,
} from './comments.repo'
import { prisma } from '@lumina/db'

export const MAX_COMMENT_DEPTH = 5 // Depths 0, 1, 2, 3, 4 (max depth limit 5)

export async function createCommentService(params: {
  postId: string
  userId: string
  content: string
  parentId?: string
}) {
  const { postId, userId, content, parentId } = params

  const trimmedContent = content?.trim()
  if (!trimmedContent || trimmedContent.length === 0) {
    throw { status: 400, message: 'Comment content cannot be empty' }
  }

  if (trimmedContent.length > 2000) {
    throw { status: 400, message: 'Comment content exceeds maximum limit of 2000 characters' }
  }

  const post = await findPostById(postId)
  if (!post) {
    throw { status: 404, message: 'POST_NOT_FOUND' }
  }

  let calculatedDepth = 0
  if (parentId) {
    const parentComment = await findCommentById(parentId)
    if (!parentComment) {
      throw { status: 404, message: 'PARENT_COMMENT_NOT_FOUND' }
    }

    if (parentComment.postId !== postId) {
      throw { status: 400, message: 'PARENT_COMMENT_POST_MISMATCH' }
    }

    if (parentComment.isDeleted) {
      throw { status: 400, message: 'CANNOT_REPLY_TO_DELETED_COMMENT' }
    }

    if (parentComment.depth >= MAX_COMMENT_DEPTH - 1) {
      throw { status: 422, message: 'COMMENT_MAX_DEPTH_EXCEEDED' }
    }

    calculatedDepth = parentComment.depth + 1
  }

  const comment = await createCommentRecord({
    content: trimmedContent,
    postId,
    userId,
    parentId,
    depth: calculatedDepth,
  })

  // Parse @username mentions
  const mentionMatches = trimmedContent.match(/@([a-zA-Z0-9_]+)/g)
  if (mentionMatches && mentionMatches.length > 0) {
    const usernames = Array.from(new Set(mentionMatches.map((m) => m.substring(1))))
    const mentionedUserIds = await createMentionsRepo(comment.id, usernames)

    for (const mentionedUserId of mentionedUserIds) {
      if (mentionedUserId !== userId) {
        await prisma.notification.create({
          data: {
            userId: mentionedUserId,
            title: 'You were mentioned in a comment',
            body: `${comment.user.name || 'Someone'} mentioned you in a comment`,
            type: 'COMMENT_MENTION',
          },
        })
      }
    }
  }

  // Create notification for post author / parent author
  if (post.authorId !== userId) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: parentId ? 'New reply to comment' : 'New comment on your post',
        body: `${comment.user.name || 'Someone'} ${parentId ? 'replied to a comment' : 'commented on your post'}`,
        type: parentId ? 'COMMENT_REPLY' : 'COMMENT',
      },
    })
  }

  return comment
}

export async function getCommentsForPostService(postId: string, cursor?: string, limit = 20) {
  const post = await findPostById(postId)
  if (!post) {
    throw { status: 404, message: 'POST_NOT_FOUND' }
  }

  return getCommentsForPostRepo(postId, cursor, limit)
}

export async function editCommentService(params: {
  commentId: string
  userId: string
  content: string
}) {
  const { commentId, userId, content } = params

  const trimmedContent = content?.trim()
  if (!trimmedContent || trimmedContent.length === 0) {
    throw { status: 400, message: 'Comment content cannot be empty' }
  }

  const comment = await findCommentById(commentId)
  if (!comment) {
    throw { status: 404, message: 'COMMENT_NOT_FOUND' }
  }

  if (comment.userId !== userId) {
    throw { status: 403, message: 'NOT_AUTHORIZED_TO_EDIT_COMMENT' }
  }

  if (comment.isDeleted) {
    throw { status: 400, message: 'CANNOT_EDIT_DELETED_COMMENT' }
  }

  return updateCommentContentRepo(
    commentId,
    trimmedContent,
    comment.content,
    userId,
    comment.version
  )
}

export async function deleteCommentService(params: {
  commentId: string
  userId: string
  userRole?: string
}) {
  const { commentId, userId, userRole } = params

  const comment = await findCommentById(commentId)
  if (!comment) {
    throw { status: 404, message: 'COMMENT_NOT_FOUND' }
  }

  const isOwner = comment.userId === userId
  const isPostOwner = comment.post.authorId === userId
  const isAdmin = userRole === 'ADMIN'

  if (!isOwner && !isPostOwner && !isAdmin) {
    throw { status: 403, message: 'NOT_AUTHORIZED_TO_DELETE_COMMENT' }
  }

  return softDeleteCommentRepo(commentId)
}

export async function toggleReactionService(params: {
  commentId: string
  userId: string
  emoji: string
}) {
  const { commentId, userId, emoji } = params

  if (!emoji || emoji.trim().length === 0) {
    throw { status: 400, message: 'Emoji character is required' }
  }

  const comment = await findCommentById(commentId)
  if (!comment) {
    throw { status: 404, message: 'COMMENT_NOT_FOUND' }
  }

  if (comment.isDeleted) {
    throw { status: 400, message: 'CANNOT_REACT_TO_DELETED_COMMENT' }
  }

  const result = await toggleReactionRepo(commentId, userId, emoji.trim())

  if (result.action === 'added' && comment.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: comment.userId,
        title: 'New reaction on your comment',
        body: `Someone reacted with ${emoji} to your comment`,
        type: 'COMMENT_REACTION',
      },
    })
  }

  return result
}

export async function removeReactionService(params: {
  commentId: string
  userId: string
  emoji: string
}) {
  const { commentId, userId, emoji } = params

  if (!emoji || emoji.trim().length === 0) {
    throw { status: 400, message: 'Emoji character is required' }
  }

  const comment = await findCommentById(commentId)
  if (!comment) {
    throw { status: 404, message: 'COMMENT_NOT_FOUND' }
  }

  return removeReactionRepo(commentId, userId, emoji.trim())
}

export async function togglePinCommentService(params: {
  commentId: string
  userId: string
  userRole?: string
}) {
  const { commentId, userId, userRole } = params

  const comment = await findCommentById(commentId)
  if (!comment) {
    throw { status: 404, message: 'COMMENT_NOT_FOUND' }
  }

  const isPostOwner = comment.post.authorId === userId
  const isAdmin = userRole === 'ADMIN'

  if (!isPostOwner && !isAdmin) {
    throw { status: 403, message: 'NOT_AUTHORIZED_TO_PIN_COMMENT' }
  }

  const nextPinnedState = !comment.isPinned
  return togglePinCommentRepo(commentId, nextPinnedState)
}

export async function reportCommentService(params: {
  commentId: string
  reporterUserId: string
  reason: string
  details?: string
}) {
  const { commentId, reporterUserId, reason, details } = params

  if (!reason || reason.trim().length === 0) {
    throw { status: 400, message: 'Reason for report is required' }
  }

  const comment = await findCommentById(commentId)
  if (!comment) {
    throw { status: 404, message: 'COMMENT_NOT_FOUND' }
  }

  try {
    return await createReportRepo(commentId, reporterUserId, reason.trim(), details?.trim())
  } catch (err: any) {
    if (err.code === 'P2002') {
      throw { status: 409, message: 'ALREADY_REPORTED_COMMENT' }
    }
    throw err
  }
}
