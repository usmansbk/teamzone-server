/*
  Warnings:

  - You are about to drop the column `profileId` on the `TeamMember` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('ADMIN', 'TEAMMATE');

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_profileId_fkey";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "profileId",
ADD COLUMN     "memberId" TEXT NOT NULL,
ADD COLUMN     "role" "TeamRole" NOT NULL DEFAULT 'TEAMMATE';

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
