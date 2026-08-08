import * as postsService from './posts.service';
import type { AuthenticatedRequest } from '@lumina/types';
import type { NextFunction, Request, Response } from 'express';
import {
  MSG_COMMENT_CANNOT_BE_EMPTY,
  MSG_FAILED_TO_CREATE_COMMENT,
  MSG_FAILED_TO_GET_LIKE_COUNT,
  MSG_FAILED_TO_TOGGLE_LIKE,
  MSG_INTERNAL_SERVER_ERROR,
  MSG_LIKE_COUNT_FETCHED_SUCCESSFULLY,
  MSG_LIKE_UPDATED,
  MSG_POST_CREATED_SUCCESSFULLY,
  MSG_POST_NOT_FOUND,
} from '@lumina/constants';

export const createPost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user.id

    const post = await postsService.createPost({
      userId,
      body: req.body,
      files: req.files as Express.Multer.File[],
    })

    res.status(201).json({
      success: true,
      message: MSG_POST_CREATED_SUCCESSFULLY,
      data: post,
    })
  } catch (error) {
    next(error)
  }
}

export const toggleLike = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await postsService.toggleLike(req.user.id, req.params.id as string)
    res.status(200).json({
      success: true,
      message: MSG_LIKE_UPDATED,
      data: result,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: MSG_FAILED_TO_TOGGLE_LIKE,
    })
  }
}

export const getLikeCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await postsService.getLikeCount(req.params.id as string)
    res.status(200).json({
      success: true,
      message: MSG_LIKE_COUNT_FETCHED_SUCCESSFULLY,
      data: result,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: MSG_FAILED_TO_GET_LIKE_COUNT,
    })
  }
}

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const postId = req.params.id
    const userId = req.user.id
    const { content, parentId } = req.body

    if (!content?.trim()) {
      return res.status(400).json({
        message: MSG_COMMENT_CANNOT_BE_EMPTY,
      })
    }

    const comment = await postsService.createComment({
      postId: postId as string,
      userId: userId,
      content: content.trim(),
      parentId: parentId ?? null,
    })

    return res.status(201).json({
      success: true,
      data: comment,
    })
  } catch (error: any) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({
        message: MSG_POST_NOT_FOUND,
      })
    }

    return res.status(500).json({
      message: MSG_FAILED_TO_CREATE_COMMENT,
    })
  }
}

export const toggleSavePost = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id: postId } = req.params
    const userId = req.user.id
    const result = await postsService.toggleSavePost({
      postId: postId as string,
      userId,
    })

    return res.status(200).json({
      success: true,
      ...result,
    })
    
  } catch (error: any) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({
        success: false,

        message: MSG_POST_NOT_FOUND,
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      message: MSG_INTERNAL_SERVER_ERROR,
    })
  }
}

export const getMySavedPosts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user.id

    const savedPosts = await postsService.getMySavedPosts(userId)

    return res.status(200).json({
      success: true,

      savedPosts,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,

      message: MSG_INTERNAL_SERVER_ERROR,
    })
    }
}
