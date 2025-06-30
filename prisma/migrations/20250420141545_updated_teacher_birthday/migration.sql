/*
  Warnings:

  - You are about to drop the column `bithday` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "bithday",
ADD COLUMN     "birthday" TIMESTAMP(3);
