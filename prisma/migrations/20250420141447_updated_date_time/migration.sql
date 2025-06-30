/*
  Warnings:

  - You are about to drop the column `endDate` on the `Event` table. All the data in the column will be lost.
  - The `birthday` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `bithday` column on the `Teacher` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `endTime` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "endDate",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "birthday",
ADD COLUMN     "birthday" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "bithday",
ADD COLUMN     "bithday" TIMESTAMP(3);
