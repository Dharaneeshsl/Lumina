import type { NextFunction, Request, Response } from "express";
import { auth } from "@lumina/auth";
import multer from "multer";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    (req as Request & { user: typeof session.user }).user = session.user;

    next();
  } catch {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

const imageMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const videoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
  }
};

const postMediaFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if ([...imageMimeTypes, ...videoMimeTypes].includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Only JPG, JPEG, PNG, WEBP images and MP4, WEBM, MOV videos are allowed."));
};

const allowedMimeTypes = imageMimeTypes;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
  fileFilter,
});

export const uploadPostMedia = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_VIDEO_SIZE,
  },
  fileFilter: postMediaFileFilter,
});