import { STREAM_API_KEY, streamVideoClient } from './video.config.ts'
import * as videoRepo from './video.repo.ts'

import type { VideoCallType } from '@lumina/db'

export const generateVideoToken = async (userId: string) => {
  const user = await videoRepo.findUserById(userId)
  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  await streamVideoClient.upsertUser({
    id: user.id,
    name: user.name || user.username || 'Lumina User',
    image: user.image || undefined,
  })

  const token = streamVideoClient.createToken(user.id)
  return {
    token,
    apiKey: STREAM_API_KEY,
    userId: user.id,
  }
}

export const createCall = async ({
  userId,
  type = 'ONE_ON_ONE',
  title,
  participantIds = [],
}: {
  userId: string
  type?: VideoCallType
  title?: string
  participantIds?: string[]
}) => {
  const caller = await videoRepo.findUserById(userId)
  if (!caller) {
    throw new Error('USER_NOT_FOUND')
  }

  // Ensure caller is included in participant set
  const allParticipantIds = Array.from(new Set([userId, ...participantIds]))

  // Security check: For 1-on-1 private calls, verify friendship or valid user target
  if (type === 'ONE_ON_ONE' && participantIds.length === 1) {
    const targetUserId = participantIds[0]
    if (targetUserId === userId) {
      throw new Error('CANNOT_CALL_SELF')
    }
    const targetUser = await videoRepo.findUserById(targetUserId)
    if (!targetUser) {
      throw new Error('TARGET_USER_NOT_FOUND')
    }
  }

  const streamCallId = `lumina_call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const call = await videoRepo.createVideoCall({
    streamCallId,
    type,
    title,
    createdById: userId,
    participantIds: allParticipantIds,
  })

  return {
    callId: call.id,
    streamCallId: call.streamCallId,
    type: call.type,
    title: call.title,
    status: call.status,
    createdBy: call.createdBy,
    participants: call.participants,
    createdAt: call.createdAt,
  }
}

export const getCallDetails = async (callId: string, userId: string) => {
  const call = await videoRepo.findCallById(callId)
  if (!call) {
    throw new Error('CALL_NOT_FOUND')
  }

  // Security Authorization Check: Verify caller is host or invited participant
  const isParticipant = call.participants.some((p) => p.userId === userId)
  const isHost = call.createdById === userId

  if (!isParticipant && !isHost && call.type !== 'GROUP') {
    throw new Error('CALL_UNAUTHORIZED')
  }

  return call
}

export const joinCall = async (callId: string, userId: string) => {
  const call = await getCallDetails(callId, userId)
  if (call.status === 'ENDED' || call.status === 'CANCELLED') {
    throw new Error('CALL_EXPIRED')
  }

  await videoRepo.updateParticipantStatus({
    callId: call.id,
    userId,
    status: 'JOINED',
    joinedAt: new Date(),
  })

  const { token, apiKey } = await generateVideoToken(userId)

  return {
    callId: call.id,
    streamCallId: call.streamCallId,
    type: call.type,
    title: call.title,
    apiKey,
    token,
    joinedAt: new Date(),
  }
}

export const respondToCallInvite = async (
  callId: string,
  userId: string,
  response: 'ACCEPT' | 'REJECT'
) => {
  const call = await videoRepo.findCallById(callId)
  if (!call) {
    throw new Error('CALL_NOT_FOUND')
  }

  const status = response === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'
  await videoRepo.updateParticipantStatus({
    callId: call.id,
    userId,
    status,
  })

  return {
    callId: call.id,
    userId,
    status,
  }
}

export const endCall = async (callId: string, userId: string) => {
  const call = await videoRepo.findCallById(callId)
  if (!call) {
    throw new Error('CALL_NOT_FOUND')
  }

  if (call.createdById !== userId) {
    throw new Error('ONLY_HOST_CAN_END_CALL')
  }

  const endedCall = await videoRepo.updateCallStatus(call.id, 'ENDED', new Date())

  return {
    callId: endedCall.id,
    status: endedCall.status,
    endedAt: endedCall.endedAt,
  }
}

export const getCallHistory = async (userId: string) => {
  const calls = await videoRepo.getUserCallHistory(userId)
  return calls.map((call) => {
    let durationMinutes = 0
    if (call.startedAt && call.endedAt) {
      durationMinutes = Math.max(
        1,
        Math.round((call.endedAt.getTime() - call.startedAt.getTime()) / 60000)
      )
    }
    return {
      id: call.id,
      streamCallId: call.streamCallId,
      type: call.type,
      title: call.title,
      status: call.status,
      durationMinutes,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      createdBy: call.createdBy,
      participants: call.participants,
    }
  })
}
