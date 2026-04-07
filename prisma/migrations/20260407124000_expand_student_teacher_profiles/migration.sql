ALTER TABLE "Student"
ADD COLUMN "aadhaarNumber" TEXT,
ADD COLUMN "course" TEXT,
ADD COLUMN "currentYear" INTEGER,
ADD COLUMN "fatherName" TEXT,
ADD COLUMN "motherName" TEXT,
ADD COLUMN "parentPhone" TEXT;

ALTER TABLE "Teacher"
ADD COLUMN "aadhaarNumber" TEXT,
ADD COLUMN "address" TEXT;

CREATE UNIQUE INDEX "Student_aadhaarNumber_key" ON "Student"("aadhaarNumber");
CREATE INDEX "Student_schoolId_aadhaarNumber_idx" ON "Student"("schoolId", "aadhaarNumber");
CREATE UNIQUE INDEX "Teacher_aadhaarNumber_key" ON "Teacher"("aadhaarNumber");
CREATE INDEX "Teacher_schoolId_lastName_firstName_idx" ON "Teacher"("schoolId", "lastName", "firstName");
