import { streamClient } from './chat.config'
import * as chatRepository from './chat.repository'


export const generateChatToken = async (userId: string) => {
  const user = await chatRepository.findUserById(userId)

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  await streamClient.upsertUser({
    id: user.id,
    name: user.username ?? '',
    image: user.avatar ?? undefined,
  })

  return streamClient.createToken(user.id)
}
export const createConversation = async ({
  userId,
  otherUserId,
}: {
  userId: string
  otherUserId: string
}) => {
  if (userId === otherUserId) {
    throw new Error('CANNOT_CHAT_WITH_SELF')
  }

  const users = await chatRepository.findUsersByIds([userId, otherUserId])

  if (users.length !== 2) {
    throw new Error('USER_NOT_FOUND')
  }

  const currentUser = users.find((user) => user.id === userId)

  const otherUser = users.find((user) => user.id === otherUserId)

  if (!currentUser || !otherUser) {
    throw new Error('USER_NOT_FOUND')
  }

  // Sync both users to Stream
  await streamClient.upsertUsers([
    {
      id: currentUser.id,
      name: currentUser.username ?? '',
      image: currentUser.avatar ?? undefined,
    },
    {
      id: otherUser.id,
      name: otherUser.username ?? '',
      image: otherUser.avatar ?? undefined,
    },
  ])

  const channelId = [userId, otherUserId].sort().join('-')

  const channel = streamClient.channel('messaging', channelId, {
    members: [userId, otherUserId],
  })

  await channel.create()

  return {
    channelId,
    type: 'messaging',
    members: [userId, otherUserId],
  }
}

export const getMyConversations = async (userId: string) => {
  const filter = {
    type: 'messaging',
    members: {
      $in: [userId],
    },
  }

  const sort = [
    {
      last_message_at: -1 as const,
    },
  ]

  const channels = await streamClient.queryChannels(filter, sort, {
    watch: false,
    state: true,
    limit: 30,
  })

  return channels.map((channel) => ({
    id: channel.id,
    cid: channel.cid,
    members: channel.state.members,
    lastMessage: channel.state.messages[channel.state.messages.length - 1] ?? null,
  }))
}