/*
  Warnings:

  - Added the required column `closingTime` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openingTime` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "School" ADD COLUMN     "closingTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "openingTime" TIMESTAMP(3) NOT NULL;
