/*
  Warnings:

  - You are about to drop the column `leetcode` on the `Profile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LeetcodeSyncStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "leetcode",
ADD COLUMN     "leetcodeEasy" INTEGER,
ADD COLUMN     "leetcodeGlobalRank" INTEGER,
ADD COLUMN     "leetcodeHard" INTEGER,
ADD COLUMN     "leetcodeMedium" INTEGER,
ADD COLUMN     "leetcodeSyncStatus" "LeetcodeSyncStatus",
ADD COLUMN     "leetcodeUrl" TEXT,
ADD COLUMN     "leetcodeUsername" TEXT;

-- CreateIndex
CREATE INDEX "Profile_leetcodeRating_idx" ON "Profile"("leetcodeRating");

-- CreateIndex
CREATE INDEX "Profile_leetcodeSolved_idx" ON "Profile"("leetcodeSolved");

-- CreateIndex
CREATE INDEX "Profile_leetcodeUsername_idx" ON "Profile"("leetcodeUsername");

-- CreateIndex
CREATE INDEX "Profile_leetcodeSyncStatus_idx" ON "Profile"("leetcodeSyncStatus");
