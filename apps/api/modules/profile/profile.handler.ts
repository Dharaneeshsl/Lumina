import { enqueueProfileSync } from '../../config/leetcode.queue'
import * as profileService from './profile.service'
import {
  MSG_FAILED_TO_DELETE_COVER_IMAGE,
  MSG_FAILED_TO_DELETE_PROFILE_PICTURE,
  MSG_FAILED_TO_FETCH_PROFILE,
  MSG_FAILED_TO_UPDATE_PROFILE,
  MSG_FAILED_TO_UPLOAD_COVER_IMAGE,
  MSG_FAILED_TO_UPLOAD_PROFILE_PICTURE,
  MSG_PROFILE_NOT_FOUND,
} from '@lumina/constants'

import type { AuthenticatedRequest, UsernameParams } from '@lumina/contracts'
import type { Request, Response } from 'express'

export async function getMyProfile(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest
    const userId = user.id

    const profile = await profileService.getMyProfile(userId)

    if (!profile) {
      return res.status(404).json({
        message: MSG_PROFILE_NOT_FOUND,
      })
    }

    return res.json(profile)
  } catch (err) {
    return res.status(500).json({
      message: MSG_FAILED_TO_FETCH_PROFILE,
    })
  }
}

export async function updateMyProfile(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest
    const userId = user.id
    const leetcodeUsername = req.body.leetcodeUrl?.split('/').filter(Boolean).pop()
    const profile = await profileService.updateMyProfile(userId, {
      ...req.body,
      leetcodeUsername,
    })
    if (leetcodeUsername) {
      await enqueueProfileSync(profile.id)
    }
    return res.json(profile)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      message: MSG_FAILED_TO_UPDATE_PROFILE,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

export async function getProfileByUsername(req: Request<UsernameParams>, res: Response) {
  try {
    const profile = await profileService.getProfileByUsername(req.params.username)

    if (!profile) {
      return res.status(404).json({
        message: MSG_PROFILE_NOT_FOUND,
      })
    }

    return res.json(profile)
  } catch (err) {
    return res.status(404).json({
      message: MSG_PROFILE_NOT_FOUND,
    })
  }
}

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest

    const result = await profileService.uploadProfilePicture(user.id, req.file!)

    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: MSG_FAILED_TO_UPLOAD_PROFILE_PICTURE,
    })
  }
}

export const deleteProfilePicture = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest

    const result = await profileService.deleteProfilePicture(user.id)

    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: MSG_FAILED_TO_DELETE_PROFILE_PICTURE,
    })
  }
}

export const uploadCoverImage = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest

    const result = await profileService.uploadCoverImage(user.id, req.file!)

    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: MSG_FAILED_TO_UPLOAD_COVER_IMAGE,
    })
  }
}

export const deleteCoverImage = async (req: Request, res: Response) => {
  try {
    const { user } = req as AuthenticatedRequest

    const result = await profileService.deleteCoverImage(user.id)

    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: MSG_FAILED_TO_DELETE_COVER_IMAGE,
    })
  }
}
