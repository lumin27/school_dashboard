/*
  Warnings:

  - You are about to drop the column `descriptions` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Event` table. All the data in the column will be lost.
  - Added the required column `description` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "descriptions",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "startDate",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "birthday" TEXT;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "bithday" TEXT;
