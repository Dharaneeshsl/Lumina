import type { Request, Response } from 'express'
import * as profileService from './profile.service'
import type { AuthenticatedRequest, UsernameParams } from '@lumina/types'
import {
  MSG_PROFILE_NOT_FOUND,
  MSG_FAILED_TO_FETCH_PROFILE,
  MSG_FAILED_TO_UPDATE_PROFILE,
  MSG_FAILED_TO_UPLOAD_PROFILE_PICTURE,
  MSG_FAILED_TO_DELETE_PROFILE_PICTURE,
  MSG_FAILED_TO_UPLOAD_COVER_IMAGE,
  MSG_FAILED_TO_DELETE_COVER_IMAGE,
} from '@lumina/constants'

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
    const { user } = req as AuthenticatedRequest;
    const userId = user.id;

    const profile = await profileService.updateMyProfile(userId, req.body);

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({
      message: MSG_FAILED_TO_UPDATE_PROFILE,
      error: err instanceof Error ? err.message : String(err),
    });
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
