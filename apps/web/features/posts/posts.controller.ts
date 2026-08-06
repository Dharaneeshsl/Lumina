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