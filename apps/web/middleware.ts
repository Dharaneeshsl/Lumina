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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});