import { Router } from "express";
import {
  getMyProfile,
  getProfileByUsername,
  updateMyProfile,
  uploadProfilePicture,
  deleteCoverImage,
  uploadCoverImage,
  deleteProfilePicture
} from "./profile.handler";
import { requireAuth  , upload} from "../../middleware";
import { MSG_PROFILE_ROUTER_WORKS } from "@lumina/constants";

export const profileRouter = Router();

profileRouter.get("/test", (req, res) => {
  res.json({ message: MSG_PROFILE_ROUTER_WORKS });
});

profileRouter.get("/me", requireAuth, getMyProfile);
profileRouter.patch("/me", requireAuth, updateMyProfile);
profileRouter.get("/:username", getProfileByUsername);
profileRouter.patch("/avatar" , requireAuth , upload.single("image") , uploadProfilePicture);
profileRouter.delete("/avatar" , requireAuth, deleteProfilePicture);
profileRouter.patch("/cover" , requireAuth ,  upload.single("image") , uploadCoverImage);
profileRouter.delete("/cover" , requireAuth , deleteCoverImage)

export default profileRouter;