import * as friendsService from './friends.service'
import {
  MSG_FAILED_TO_ACCEPT_FRIEND_REQUEST,
  MSG_FAILED_TO_CANCEL_FRIEND_REQUEST,
  MSG_FAILED_TO_FETCH_FRIENDS,
  MSG_FAILED_TO_FETCH_INCOMING_REQUESTS,
  MSG_FAILED_TO_FETCH_MUTUAL_FRIENDS,
  MSG_FAILED_TO_FETCH_OUTGOING_REQUESTS,
  MSG_FAILED_TO_REJECT_FRIEND_REQUEST,
  MSG_FAILED_TO_REMOVE_FRIEND,
  MSG_FAILED_TO_SEND_FRIEND_REQUEST,
} from '@lumina/constants'

import type { AuthenticatedRequest } from '@lumina/contracts'
import type { Request, Response } from 'express'

export async function sendFriendRequest(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest

    const result = await friendsService.sendFriendRequest(user.id, req.params.userId as string)

    return res.status(201).json(result)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: MSG_FAILED_TO_SEND_FRIEND_REQUEST,
    })
  }
}

export async function acceptFriendRequest(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest

    const result = await friendsService.acceptFriendRequest(user.id, req.params.requestId as string)

    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: MSG_FAILED_TO_ACCEPT_FRIEND_REQUEST,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

export async function rejectFriendRequest(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest

    const result = await friendsService.rejectFriendRequest(user.id, req.params.requestId as string)

    return res.status(200).json(result)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: MSG_FAILED_TO_REJECT_FRIEND_REQUEST,
    })
  }
}

export async function cancelFriendRequest(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest

    const result = await friendsService.cancelFriendRequest(user.id, req.params.requestId as string)

    return res.status(200).json(result)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: MSG_FAILED_TO_CANCEL_FRIEND_REQUEST,
    })
  }
}

export async function unfriend(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest

    const result = await friendsService.unfriend(user.id, req.params.friendId as string)

    return res.status(200).json(result)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: MSG_FAILED_TO_REMOVE_FRIEND,
    })
  }
}

export async function getMyFriends(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest

    const friends = await friendsService.getMyFriends(user.id)

    return res.status(200).json(friends)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: MSG_FAILED_TO_FETCH_FRIENDS,
    })
  }
}

export async function getIncomingRequests(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest

    const requests = await friendsService.getIncomingRequests(user.id)

    return res.status(200).json(requests)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: MSG_FAILED_TO_FETCH_INCOMING_REQUESTS,
    })
  }
}

export async function getOutgoingRequests(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest

    const requests = await friendsService.getOutgoingRequests(user.id)

    return res.status(200).json(requests)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: MSG_FAILED_TO_FETCH_OUTGOING_REQUESTS,
    })
  }
}

export async function getMutualFriends(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest

    const friends = await friendsService.getMutualFriends(user.id, req.params.userId as string)

    return res.status(200).json(friends)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: MSG_FAILED_TO_FETCH_MUTUAL_FRIENDS,
    })
  }
}
