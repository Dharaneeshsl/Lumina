import type { NextFunction, Request, Response } from "express";
import { auth } from "@lumina/auth";

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