/*
  Warnings:

  - You are about to drop the `GradeClass` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GradeClass" DROP CONSTRAINT "GradeClass_classId_fkey";

-- DropForeignKey
ALTER TABLE "GradeClass" DROP CONSTRAINT "GradeClass_gradeId_fkey";

-- DropTable
DROP TABLE "GradeClass";

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
