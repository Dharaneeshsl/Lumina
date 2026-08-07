import { Router } from "express";
import {
  getMyProfile,
  getProfileByUsername,
  updateMyProfile,
  uploadProfilePicture,
  deleteCoverImage,
  uploadCoverImage,
  deleteProfilePicture
} from "./profile.controller";
import { requireAuth  , upload} from "../../middleware";

export const profileRouter = Router();

profileRouter.get("/test", (req, res) => {
  res.json({ message: "profile router works" });
});

profileRouter.get("/me", requireAuth, getMyProfile);
profileRouter.patch("/me", requireAuth, updateMyProfile);
profileRouter.get("/:username", getProfileByUsername);
profileRouter.patch("/avatar" , requireAuth , upload.single("image") , uploadProfilePicture);
profileRouter.delete("/avatar" , requireAuth, deleteProfilePicture);
profileRouter.patch("/cover" , requireAuth ,  upload.single("image") , uploadCoverImage);
profileRouter.delete("/cover" , requireAuth , deleteCoverImage)

export default profileRouter;