/*
  Warnings:

  - You are about to drop the column `classId` on the `Announcement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_classId_fkey";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "classId";

-- CreateTable
CREATE TABLE "AnnouncementClass" (
    "id" SERIAL NOT NULL,
    "announcementId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "AnnouncementClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementClass_announcementId_classId_key" ON "AnnouncementClass"("announcementId", "classId");

-- AddForeignKey
ALTER TABLE "AnnouncementClass" ADD CONSTRAINT "AnnouncementClass_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementClass" ADD CONSTRAINT "AnnouncementClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
