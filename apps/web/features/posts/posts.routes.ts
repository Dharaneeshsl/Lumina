import { requireAuth, uploadPostMedia } from '../../middleware';
import { createPost, getLikeCount, toggleLike, createComment, toggleSavePost, getMySavedPosts } from './posts.controller';
import { Router } from 'express';
import type { AuthenticatedRequest } from '@lumina/types';
import type { NextFunction, Request, Response } from 'express';

const router = Router();


router.post('/',requireAuth, uploadPostMedia.array('media', 10), async (req: Request, res: Response, next: NextFunction) => {
    await createPost(req as AuthenticatedRequest, res, next)
  }
)
router.post('/:id/like', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  await toggleLike(req as AuthenticatedRequest, res)
})
router.get('/:id/likes/count', requireAuth, async (req: Request, res: Response) => {
  await getLikeCount(req as AuthenticatedRequest, res)
})

router.post('/:id/comments', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  await createComment(req as AuthenticatedRequest, res)
})

router.post('/:id/save', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  await toggleSavePost(req as AuthenticatedRequest, res)
})

router.get('/saved', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  await getMySavedPosts(req as AuthenticatedRequest, res)
})

export default router