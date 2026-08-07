import type{ Request, Response, NextFunction } from "express";
import * as postsService from "./posts.service";
import type { AuthenticatedRequest } from "@lumina/types";

export const createPost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user.id;

    const post = await postsService.createPost({
      userId,
      body: req.body,
      files: req.files as Express.Multer.File[],
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully.",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await postsService.toggleLike(
      req.user.id,
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: "Like updated.",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like.",
    });
  }
};

export const getLikeCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await postsService.getLikeCount(req.params.id as string);
    res.status(200).json({
      success: true,
      message: "Like count fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get like count.",
    });
  }
};