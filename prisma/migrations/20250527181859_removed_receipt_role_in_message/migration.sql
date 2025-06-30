/*
  Warnings:

  - You are about to drop the column `recipientRole` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "name" TEXT,
ADD COLUMN     "surname" TEXT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "recipientRole";

-- DropEnum
DROP TYPE "Role";
