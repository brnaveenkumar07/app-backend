DROP INDEX IF EXISTS "AttendanceSession_sectionId_subjectId_date_key";

CREATE UNIQUE INDEX "AttendanceSession_sectionId_subjectId_date_slotNumber_key"
ON "AttendanceSession"("sectionId", "subjectId", "date", "slotNumber");
