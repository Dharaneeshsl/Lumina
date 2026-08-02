import type { Request, Response } from "express";
import * as profileService from "./profile.service";
import type { AuthenticatedRequest , UsernameParams } from "@lumina/types"



export async function getMyProfile(req: AuthenticatedRequest , res: Response) {
  try {
    const userId = req.user.id; 

    const profile = await profileService.getMyProfile(userId);

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
}

export async function updateMyProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user.id;

    const profile = await profileService.updateMyProfile(
      userId,
      req.body
    );

    return res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
}

export async function getProfileByUsername(
  req: Request<UsernameParams>,
  res: Response
) {
  try {
    const profile = await profileService.getProfileByUsername(
      req.params.username
    );

    return res.json(profile);
  } catch (err) {
    return res.status(404).json({
      message: "Profile not found",
    });
  }
}