import { Router} from "express";
import { createPost, toggleLike , getLikeCount} from "./posts.controller";
import { uploadPostMedia , requireAuth} from "../../middleware";
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@lumina/types";



const router = Router();

router.post("/", requireAuth, uploadPostMedia.array("media", 10), async (req: Request, res: Response, next: NextFunction) => {
   await createPost(req as AuthenticatedRequest, res, next);
});
router.post("/:id/like", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
   await toggleLike(req as AuthenticatedRequest, res);
});
router.get("/:id/likes/count",requireAuth, async (req: Request, res: Response) => {
   await getLikeCount(req as AuthenticatedRequest, res);
  }
);





export default router;