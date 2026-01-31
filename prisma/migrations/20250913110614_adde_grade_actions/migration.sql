-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_gradeId_fkey";

-- CreateTable
CREATE TABLE "GradeClass" (
    "id" SERIAL NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "GradeClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GradeClass_gradeId_classId_key" ON "GradeClass"("gradeId", "classId");

-- AddForeignKey
ALTER TABLE "GradeClass" ADD CONSTRAINT "GradeClass_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeClass" ADD CONSTRAINT "GradeClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
