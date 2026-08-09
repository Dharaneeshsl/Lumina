import "@lumina/env";
import friendsRouter from "./features/friends/friends.routes.ts";
import postsRouter from "./features/posts/posts.routes.ts";
import { profileRouter } from "./features/profile/profile.routes.ts";
import chatRoutes from "./features/chat/chat.route.ts";
import leaderboardRouter from "./features/leaderboard/leaderboard.routes.ts";
import leetcodeRouter from "./features/leetcode/leetcode.routes.ts";
import { startCronJobs } from "./cron/index.ts";
import "./config/leetcode.worker.ts";
import { auth } from "@lumina/auth";
import { MSG_OK } from "@lumina/constants";
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { Request, Response } from "express";


const app = express();

const PORT = process.env.SERVER_PORT;


app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  credentials: true,
}));


app.all("/api/auth/*path", toNodeHandler(auth));
app.use("/api/profile", profileRouter);
app.use("/api/friends", friendsRouter);
app.use('/api/posts', postsRouter)
app.use('/api/chat', chatRoutes)
app.use('/api/leaderboard', leaderboardRouter)
app.use('/api/leetcode', leetcodeRouter)



app.get("/ok" , (req : Request, res: Response) => {
    res.status(200).json({ message: MSG_OK });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startCronJobs().catch((error) => {
    console.error('[cron] Failed to start cron jobs:', error);
  });
});