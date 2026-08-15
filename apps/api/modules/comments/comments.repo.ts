import { prisma } from '@lumina/db'

export async function findPostById(postId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, visibility: true },
  })
}

export async function findCommentById(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
      post: { select: { id: true, authorId: true } },
      reactions: true,
      mentions: {
        include: { mentionedUser: { select: { id: true, name: true, username: true } } },
      },
    },
  })
}

export async function createCommentRecord(data: {
  content: string
  postId: string
  userId: string
  parentId?: string
  depth: number
}) {
  return prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        userId: data.userId,
        parentId: data.parentId ?? null,
        depth: data.depth,
      },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    })

    await tx.post.update({
      where: { id: data.postId },
      data: { commentCount: { increment: 1 } },
    })

    return comment
  })
}

function formatCommentWithReactions(comment: any) {
  const reactionCounts: Record<string, number> = {}
  if (comment.reactions) {
    for (const r of comment.reactions) {
      reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
    }
  }

  const formattedReplies = comment.replies
    ? comment.replies.map((reply: any) => formatCommentWithReactions(reply))
    : []

  return {
    ...comment,
    reactionCounts,
    replies: formattedReplies,
  }
}

export async function getCommentsForPostRepo(postId: string, cursor?: string, limit = 20) {
  const rawComments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
      reactions: true,
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
          reactions: true,
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { id: true, name: true, username: true, image: true } },
              reactions: true,
            },
          },
        },
      },
    },
  })

  let nextCursor: string | undefined = undefined
  if (rawComments.length > limit) {
    const nextItem = rawComments.pop()
    nextCursor = nextItem?.id
  }

  const comments = rawComments.map((c) => formatCommentWithReactions(c))

  return { comments, nextCursor }
}

export async function updateCommentContentRepo(
  commentId: string,
  newContent: string,
  previousContent: string,
  editedByUserId: string,
  currentVersion: number
) {
  return prisma.$transaction(async (tx) => {
    await tx.commentEditHistory.create({
      data: {
        commentId,
        previousContent,
        editedByUserId,
        version: currentVersion,
      },
    })

    const updated = await tx.comment.update({
      where: { id: commentId, version: currentVersion },
      data: {
        content: newContent,
        version: { increment: 1 },
      },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    })

    return updated
  })
}

export async function softDeleteCommentRepo(commentId: string) {
  return prisma.comment.update({
    where: { id: commentId },
    data: {
      isDeleted: true,
      content: '[Comment deleted]',
    },
  })
}

export async function toggleReactionRepo(commentId: string, userId: string, emoji: string) {
  const existing = await prisma.commentReaction.findUnique({
    where: {
      commentId_userId_emoji: { commentId, userId, emoji },
    },
  })

  if (existing) {
    await prisma.commentReaction.delete({
      where: { id: existing.id },
    })
    return { action: 'removed', emoji }
  } else {
    const reaction = await prisma.commentReaction.create({
      data: { commentId, userId, emoji },
    })
    return { action: 'added', reaction }
  }
}

export async function removeReactionRepo(commentId: string, userId: string, emoji: string) {
  const existing = await prisma.commentReaction.findUnique({
    where: {
      commentId_userId_emoji: { commentId, userId, emoji },
    },
  })

  if (existing) {
    await prisma.commentReaction.delete({
      where: { id: existing.id },
    })
  }

  return { action: 'removed', emoji }
}

export async function togglePinCommentRepo(commentId: string, isPinned: boolean) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { isPinned },
  })
}

export async function createReportRepo(
  commentId: string,
  reporterUserId: string,
  reason: string,
  details?: string
) {
  return prisma.commentReport.create({
    data: {
      commentId,
      reporterUserId,
      reason,
      details,
    },
  })
}

export async function createMentionsRepo(commentId: string, usernames: string[]) {
  const users = await prisma.user.findMany({
    where: { username: { in: usernames } },
    select: { id: true },
  })

  const mentionData = users.map((u) => ({
    commentId,
    mentionedUserId: u.id,
  }))

  if (mentionData.length > 0) {
    await prisma.commentMention.createMany({
      data: mentionData,
      skipDuplicates: true,
    })
  }

  return users.map((u) => u.id)
}
