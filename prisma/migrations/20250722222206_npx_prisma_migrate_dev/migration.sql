/*
  Warnings:

  - Added the required column `updatedAt` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "School_name_key";

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
