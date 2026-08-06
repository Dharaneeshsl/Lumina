import { Router } from "express";
import { createPost } from "./posts.controller";
import { upload } from "../../middleware";
import { requireAuth } from "../../middleware";
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@lumina/types";


const router = Router();

router.post("/", requireAuth, upload.array("media", 10), async (req: Request, res: Response, next: NextFunction) => {
  await createPost(req as AuthenticatedRequest, res, next);
});

export default router;