-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "leetcodeSyncError" TEXT;

-- CreateIndex
CREATE INDEX "Profile_leetcodeUpdatedAt_idx" ON "Profile"("leetcodeUpdatedAt");
