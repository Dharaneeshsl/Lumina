import * as postsRepository from "./posts.repository";
import { uploadFile } from "@lumina/storage";
import { prisma } from "@repo/database";
import type { CreatePostInput } from "@lumina/types";



export const createPost = async ({
  userId,
  body,
  files,
}: CreatePostInput) => {
  const { content, visibility, anonymous = false, location } = body;

  const mediaFiles = files ?? [];

  if ((!content || content.trim() === "") && mediaFiles.length === 0) {
    throw new Error("Post must contain either text or media.");
  }

  if (mediaFiles.length > 10) {
    throw new Error("Maximum 10 media files are allowed.");
  }

  const uploadedMedia = await Promise.all(
    mediaFiles.map(async (file) => {
      const uploaded = await uploadFile({
        buffer: file.buffer,
        mimeType: file.mimetype,
        folder: `posts/${userId}/media`,
        fileName: file.originalname,
      });

      return {
        type: file.mimetype.startsWith("image/")
          ? "IMAGE"
          : "VIDEO",
        url: uploaded.url,
        key: uploaded.key,
        mimeType: file.mimetype,
        size: file.size,
        width: null,
        height: null,
        duration: null,
      };
    })
  );

  return prisma.$transaction(async (tx) => {
    const post = await postsRepository.createPost(
      tx,
      userId,
      content,
      visibility,
      anonymous,
      location
    );

    if (uploadedMedia.length > 0) {
      await postsRepository.createMedia(
        tx,
        post.id,
        uploadedMedia
      );
    }

    return await postsRepository.findPostById(tx, post.id);
  });
};