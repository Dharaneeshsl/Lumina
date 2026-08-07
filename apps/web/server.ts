import "@lumina/env";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { auth } from "@lumina/auth";
import { toNodeHandler } from "better-auth/node";
import { profileRouter } from "./features/profile/profile.routes.ts";
import friendsRouter from "./features/friends/friends.routes.ts";
import postsRouter from "./features/posts/posts.routes.ts";

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
app.use("/api/posts", postsRouter);



app.get("/ok" , (req : Request, res: Response) => {
    res.status(200).json({ message: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});