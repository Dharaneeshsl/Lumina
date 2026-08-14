import * as videoService from './video.service.ts'
import { logger } from '@lumina/observability'

import type { AuthRequest } from '../../middleware'
import type { Response } from 'express'

export const getVideoToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'UNAUTHORIZED' })
    }
    const tokenData = await videoService.generateVideoToken(userId)
    return res.status(200).json(tokenData)
  } catch (error) {
    logger.error('Failed to generate video token', { metadata: { error: String(error) } })
    return res
      .status(500)
      .json({ message: error instanceof Error ? error.message : 'SERVER_ERROR' })
  }
}

export const createCall = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'UNAUTHORIZED' })
    }
    const { type, title, participantIds } = req.body
    const callData = await videoService.createCall({
      userId,
      type,
      title,
      participantIds,
    })
    return res.status(201).json(callData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SERVER_ERROR'
    if (message === 'CANNOT_CALL_SELF' || message === 'TARGET_USER_NOT_FOUND') {
      return res.status(400).json({ message })
    }
    logger.error('Failed to create video call', { metadata: { error: String(error) } })
    return res.status(500).json({ message })
  }
}

export const getCallDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'UNAUTHORIZED' })
    }
    const { callId } = req.params
    const call = await videoService.getCallDetails(callId, userId)
    return res.status(200).json(call)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SERVER_ERROR'
    if (message === 'CALL_NOT_FOUND') {
      return res.status(404).json({ message })
    }
    if (message === 'CALL_UNAUTHORIZED') {
      return res.status(403).json({ message })
    }
    return res.status(500).json({ message })
  }
}

export const joinCall = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'UNAUTHORIZED' })
    }
    const { callId } = req.params
    const joinData = await videoService.joinCall(callId, userId)
    return res.status(200).json(joinData)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SERVER_ERROR'
    if (message === 'CALL_NOT_FOUND') {
      return res.status(404).json({ message })
    }
    if (message === 'CALL_UNAUTHORIZED') {
      return res.status(403).json({ message })
    }
    if (message === 'CALL_EXPIRED') {
      return res.status(410).json({ message })
    }
    logger.error('Failed to join video call', { metadata: { error: String(error) } })
    return res.status(500).json({ message })
  }
}

export const respondToInvite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'UNAUTHORIZED' })
    }
    const { callId } = req.params
    const { response } = req.body
    if (response !== 'ACCEPT' && response !== 'REJECT') {
      return res.status(400).json({ message: 'INVALID_RESPONSE' })
    }
    const result = await videoService.respondToCallInvite(callId, userId, response)
    return res.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SERVER_ERROR'
    if (message === 'CALL_NOT_FOUND') {
      return res.status(404).json({ message })
    }
    return res.status(500).json({ message })
  }
}

export const endCall = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'UNAUTHORIZED' })
    }
    const { callId } = req.params
    const result = await videoService.endCall(callId, userId)
    return res.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SERVER_ERROR'
    if (message === 'CALL_NOT_FOUND') {
      return res.status(404).json({ message })
    }
    if (message === 'ONLY_HOST_CAN_END_CALL') {
      return res.status(403).json({ message })
    }
    logger.error('Failed to end video call', { metadata: { error: String(error) } })
    return res.status(500).json({ message })
  }
}

export const getCallHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'UNAUTHORIZED' })
    }
    const history = await videoService.getCallHistory(userId)
    return res.status(200).json(history)
  } catch (error) {
    logger.error('Failed to fetch call history', { metadata: { error: String(error) } })
    return res.status(500).json({ message: 'SERVER_ERROR' })
  }
}
