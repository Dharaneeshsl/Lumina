import { Prisma } from "@prisma/client";

export const createPost = async (
  tx: Prisma.TransactionClient,
  authorId: string,
  content: string | undefined,
  visibility: any,
  anonymous = false,
  location?: string
) => {
  return tx.post.create({
    data: {
      authorId,
      content,
      //@ts-ignore
      visibility,
      anonymous,
      location,
    },
  });
};

export const createMedia = async (
  tx: Prisma.TransactionClient,
  postId: string,
  media: any[]
) => {
  //@ts-ignore
  return tx.postMedia.createMany({
    data: media.map((item, index) => ({
      postId,
      type: item.type,
      url: item.url,
      key: item.key,
      mimeType: item.mimeType,
      size: item.size,
      width: item.width ?? null,
      height: item.height ?? null,
      duration: item.duration ?? null,
      order: index,
    })),
  });
};

export const findPostById = async (
  tx: Prisma.TransactionClient,
  postId: string
) => {
  return tx.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
      media: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
};

export const findLike = (
  tx: Prisma.TransactionClient,
  userId: string,
  postId: string
) => {
  return tx.like.findUnique({
      where: {
          userId_postId: {
              userId,
              postId,
          },
      },
  });
};

export const getLikeCount = async (
  tx: Prisma.TransactionClient,
  postId: string
) => {
    return tx.like.count({
      where: {
        postId,
      },
    });
  };