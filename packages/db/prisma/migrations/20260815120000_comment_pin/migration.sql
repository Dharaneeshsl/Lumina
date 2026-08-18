-- AlterTable
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Comment_postId_isPinned_idx" ON "Comment"("postId", "isPinned");
