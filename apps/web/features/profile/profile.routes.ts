import { Router } from "express";
import {
  getMyProfile,
  getProfileByUsername,
  updateMyProfile,
} from "./profile.controller";

import { requireAuth } from "../../middleware";

export const profileRouter = Router();

profileRouter.get("/test", (req, res) => {
  res.json({ message: "profile router works" });
});

//@ts-ignore
profileRouter.get("/me", requireAuth, getMyProfile);
//@ts-ignore
profileRouter.patch("/me", requireAuth, updateMyProfile);
profileRouter.get("/:username", getProfileByUsername);

export default profileRouter;