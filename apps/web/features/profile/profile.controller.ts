import type { Request, Response } from 'express'
import * as profileService from './profile.service'
import type { AuthenticatedRequest, UsernameParams } from '@lumina/types'

export async function getMyProfile(req: Request, res: Response) {
  try {
    const { user } = req as AuthenticatedRequest
    const userId = user.id

    const profile = await profileService.getMyProfile(userId)

    if (!profile) {
      return res.status(404).json({
        message: 'Profile not found',
      })
    }

    return res.json(profile)
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to fetch profile',
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
      message: "Failed to update profile",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function getProfileByUsername(req: Request<UsernameParams>, res: Response) {
  try {
    const profile = await profileService.getProfileByUsername(req.params.username)

    if (!profile) {
      return res.status(404).json({
        message: 'Profile not found',
      })
    }

    return res.json(profile)
  } catch (err) {
    return res.status(404).json({
      message: 'Profile not found',
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
      message: 'Failed to upload profile picture',
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
      message: 'Failed to delete profile picture',
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
      message: 'Failed to upload cover image',
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
      message: 'Failed to delete cover image',
    })
  }
}
