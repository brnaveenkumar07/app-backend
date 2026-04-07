import {
  AnnouncementAudience,
  AssessmentType,
  AttendanceStatus,
  PrismaClient,
  ResultStatus,
  SemesterStatus,
  SubjectType,
  UserRole,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password@123';
const ACTIVE_YEAR_NAME = '2026-2027';
const ACTIVE_TERM_NAME = '2026 Odd Semester';

type DepartmentSeed = {
  code: string;
  name: string;
  shortName: string;
  schemeLabel: string;
};

type SubjectSeed = {
  code: string;
  name: string;
  type: SubjectType;
  credits: number;
  lectureHours: number;
  practicalHours: number;
};

const departments: DepartmentSeed[] = [
  { code: 'CSE', name: 'Computer Science and Engineering', shortName: 'CSE', schemeLabel: 'VTU 2022' },
  { code: 'ISE', name: 'Information Science and Engineering', shortName: 'ISE', schemeLabel: 'VTU 2022' },
  { code: 'ECE', name: 'Electronics and Communication Engineering', shortName: 'ECE', schemeLabel: 'VTU 2022' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering', shortName: 'EEE', schemeLabel: 'VTU 2022' },
  { code: 'ME', name: 'Mechanical Engineering', shortName: 'ME', schemeLabel: 'VTU 2022' },
];

const semesterSubjects: Record<number, SubjectSeed[]> = {
  1: [
    { code: 'MAT101', name: 'Engineering Mathematics I', type: SubjectType.THEORY, credits: 4, lectureHours: 4, practicalHours: 0 },
    { code: 'PHY101', name: 'Engineering Physics', type: SubjectType.THEORY, credits: 4, lectureHours: 3, practicalHours: 2 },
    { code: 'CIV101', name: 'Elements of Civil Engineering', type: SubjectType.THEORY, credits: 3, lectureHours: 3, practicalHours: 0 },
    { code: 'WS101', name: 'Workshop Practice', type: SubjectType.LAB, credits: 2, lectureHours: 0, practicalHours: 4 },
  ],
  2: [
    { code: 'MAT201', name: 'Engineering Mathematics II', type: SubjectType.THEORY, credits: 4, lectureHours: 4, practicalHours: 0 },
    { code: 'CHE201', name: 'Engineering Chemistry', type: SubjectType.THEORY, credits: 4, lectureHours: 3, practicalHours: 2 },
    { code: 'BEE201', name: 'Basic Electrical Engineering', type: SubjectType.THEORY, credits: 3, lectureHours: 3, practicalHours: 0 },
    { code: 'PPS201', name: 'Programming for Problem Solving Lab', type: SubjectType.LAB, credits: 2, lectureHours: 0, practicalHours: 4 },
  ],
  3: [
    { code: 'CS301', name: 'Discrete Mathematical Structures', type: SubjectType.THEORY, credits: 4, lectureHours: 4, practicalHours: 0 },
    { code: 'CS302', name: 'Data Structures and Applications', type: SubjectType.THEORY, credits: 4, lectureHours: 3, practicalHours: 2 },
    { code: 'CSL303', name: 'Data Structures Laboratory', type: SubjectType.LAB, credits: 2, lectureHours: 0, practicalHours: 4 },
    { code: 'UHV304', name: 'Universal Human Values', type: SubjectType.ACTIVITY, credits: 1, lectureHours: 2, practicalHours: 0 },
  ],
  4: [
    { code: 'CS401', name: 'Analysis and Design of Algorithms', type: SubjectType.THEORY, credits: 4, lectureHours: 4, practicalHours: 0 },
    { code: 'CS402', name: 'Database Management Systems', type: SubjectType.THEORY, credits: 4, lectureHours: 3, practicalHours: 2 },
    { code: 'CSL403', name: 'Database Laboratory', type: SubjectType.LAB, credits: 2, lectureHours: 0, practicalHours: 4 },
    { code: 'AEC404', name: 'Ability Enhancement Course', type: SubjectType.ACTIVITY, credits: 1, lectureHours: 2, practicalHours: 0 },
  ],
  5: [
    { code: 'CS501', name: 'Operating Systems', type: SubjectType.THEORY, credits: 4, lectureHours: 4, practicalHours: 0 },
    { code: 'CS502', name: 'Computer Networks', type: SubjectType.THEORY, credits: 4, lectureHours: 4, practicalHours: 0 },
    { code: 'CSL503', name: 'System Software Laboratory', type: SubjectType.LAB, credits: 2, lectureHours: 0, practicalHours: 4 },
    { code: 'PRJ504', name: 'Mini Project', type: SubjectType.PROJECT, credits: 2, lectureHours: 0, practicalHours: 4 },
  ],
  6: [
    { code: 'CS601', name: 'Compiler Design', type: SubjectType.THEORY, credits: 4, lectureHours: 4, practicalHours: 0 },
    { code: 'CS602', name: 'Web Technologies', type: SubjectType.THEORY, credits: 4, lectureHours: 3, practicalHours: 2 },
    { code: 'CSL603', name: 'Web Technologies Laboratory', type: SubjectType.LAB, credits: 2, lectureHours: 0, practicalHours: 4 },
    { code: 'INT604', name: 'Industry Interaction Seminar', type: SubjectType.SEMINAR, credits: 1, lectureHours: 1, practicalHours: 0 },
  ],
  7: [
    { code: 'CS701', name: 'Machine Learning', type: SubjectType.THEORY, credits: 4, lectureHours: 3, practicalHours: 2 },
    { code: 'CS702', name: 'Cloud Computing', type: SubjectType.THEORY, credits: 4, lectureHours: 4, practicalHours: 0 },
    { code: 'CSL703', name: 'Machine Learning Laboratory', type: SubjectType.LAB, credits: 2, lectureHours: 0, practicalHours: 4 },
    { code: 'PRJ704', name: 'Project Phase I', type: SubjectType.PROJECT, credits: 2, lectureHours: 0, practicalHours: 4 },
  ],
  8: [
    { code: 'CS801', name: 'Information Security', type: SubjectType.THEORY, credits: 3, lectureHours: 3, practicalHours: 0 },
    { code: 'CS802', name: 'Professional Elective', type: SubjectType.ELECTIVE, credits: 3, lectureHours: 3, practicalHours: 0 },
    { code: 'PRJ803', name: 'Project Phase II', type: SubjectType.PROJECT, credits: 8, lectureHours: 0, practicalHours: 12 },
    { code: 'SEM804', name: 'Technical Seminar', type: SubjectType.SEMINAR, credits: 1, lectureHours: 1, practicalHours: 0 },
  ],
};

function trimOrNull(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

async function ensureUser(email: string, role: UserRole, passwordHash: string, phone?: string | null) {
  return prisma.user.upsert({
    where: { email },
    update: {
      role,
      isActive: true,
      phone: trimOrNull(phone),
      passwordHash,
    },
    create: {
      email,
      role,
      phone: trimOrNull(phone),
      passwordHash,
      isActive: true,
    },
  });
}

async function upsertAdminProfile(input: {
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  schoolId: string;
  phone?: string;
  passwordHash: string;
}) {
  const user = await ensureUser(input.email, UserRole.ADMIN, input.passwordHash, input.phone);

  await prisma.admin.upsert({
    where: { userId: user.id },
    update: {
      schoolId: input.schoolId,
      firstName: input.firstName,
      lastName: input.lastName,
      employeeId: input.employeeId,
    },
    create: {
      userId: user.id,
      schoolId: input.schoolId,
      firstName: input.firstName,
      lastName: input.lastName,
      employeeId: input.employeeId,
    },
  });

  return prisma.admin.findUniqueOrThrow({ where: { userId: user.id } });
}

async function upsertTeacherProfile(input: {
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  schoolId: string;
  departmentId?: string | null;
  phone?: string;
  aadhaarNumber?: string;
  designation?: string;
  qualification?: string;
  specialization?: string;
  address?: string;
  passwordHash: string;
}) {
  const user = await ensureUser(input.email, UserRole.TEACHER, input.passwordHash, input.phone);

  await prisma.teacher.upsert({
    where: { userId: user.id },
    update: {
      schoolId: input.schoolId,
      departmentId: input.departmentId ?? null,
      firstName: input.firstName,
      lastName: input.lastName,
      employeeId: input.employeeId,
      aadhaarNumber: trimOrNull(input.aadhaarNumber),
      designation: trimOrNull(input.designation),
      qualification: trimOrNull(input.qualification),
      specialization: trimOrNull(input.specialization),
      address: trimOrNull(input.address),
    },
    create: {
      userId: user.id,
      schoolId: input.schoolId,
      departmentId: input.departmentId ?? null,
      firstName: input.firstName,
      lastName: input.lastName,
      employeeId: input.employeeId,
      aadhaarNumber: trimOrNull(input.aadhaarNumber),
      designation: trimOrNull(input.designation),
      qualification: trimOrNull(input.qualification),
      specialization: trimOrNull(input.specialization),
      address: trimOrNull(input.address),
    },
  });

  return prisma.teacher.findUniqueOrThrow({ where: { userId: user.id } });
}

async function upsertStudentProfile(input: {
  email: string;
  firstName: string;
  lastName: string;
  schoolId: string;
  sectionId: string;
  departmentId?: string | null;
  admissionNo: string;
  rollNumber: string;
  usn: string;
  phone?: string;
  aadhaarNumber?: string;
  course?: string;
  currentYear?: number;
  currentSemester?: number;
  batchStartYear?: number;
  dateOfBirth?: Date;
  gender?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  passwordHash: string;
}) {
  const user = await ensureUser(input.email, UserRole.STUDENT, input.passwordHash, input.phone);

  await prisma.student.upsert({
    where: { userId: user.id },
    update: {
      schoolId: input.schoolId,
      sectionId: input.sectionId,
      departmentId: input.departmentId ?? null,
      admissionNo: input.admissionNo,
      rollNumber: input.rollNumber,
      usn: input.usn,
      aadhaarNumber: trimOrNull(input.aadhaarNumber),
      course: trimOrNull(input.course),
      currentYear: input.currentYear ?? null,
      currentSemester: input.currentSemester ?? null,
      batchStartYear: input.batchStartYear ?? null,
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth ?? null,
      gender: trimOrNull(input.gender),
      fatherName: trimOrNull(input.fatherName),
      motherName: trimOrNull(input.motherName),
      parentPhone: trimOrNull(input.parentPhone),
      guardianName: trimOrNull(input.guardianName),
      guardianPhone: trimOrNull(input.guardianPhone),
      address: trimOrNull(input.address),
    },
    create: {
      userId: user.id,
      schoolId: input.schoolId,
      sectionId: input.sectionId,
      departmentId: input.departmentId ?? null,
      admissionNo: input.admissionNo,
      rollNumber: input.rollNumber,
      usn: input.usn,
      aadhaarNumber: trimOrNull(input.aadhaarNumber),
      course: trimOrNull(input.course),
      currentYear: input.currentYear ?? null,
      currentSemester: input.currentSemester ?? null,
      batchStartYear: input.batchStartYear ?? null,
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth ?? null,
      gender: trimOrNull(input.gender),
      fatherName: trimOrNull(input.fatherName),
      motherName: trimOrNull(input.motherName),
      parentPhone: trimOrNull(input.parentPhone),
      guardianName: trimOrNull(input.guardianName),
      guardianPhone: trimOrNull(input.guardianPhone),
      address: trimOrNull(input.address),
    },
  });

  return prisma.student.findUniqueOrThrow({ where: { userId: user.id } });
}

async function ensureStudentProfileDetails(studentId: string, parentEmail: string) {
  await prisma.studentProfile.upsert({
    where: { studentId },
    update: {
      bloodGroup: 'O+',
      emergencyContactName: 'Parent Contact',
      emergencyContactPhone: '9876500000',
      parentEmail,
      addressLine1: 'SVIT Campus Road',
      addressLine2: 'College Hostel Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560060',
    },
    create: {
      studentId,
      bloodGroup: 'O+',
      emergencyContactName: 'Parent Contact',
      emergencyContactPhone: '9876500000',
      parentEmail,
      addressLine1: 'SVIT Campus Road',
      addressLine2: 'College Hostel Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560060',
    },
  });
}

async function main() {
  const passwordHash = await argon2.hash(DEFAULT_PASSWORD);

  const school = await prisma.school.upsert({
    where: { code: 'SVIT' },
    update: {
      name: 'Sri Venkateshwara Institute of Technology',
      address: 'Vidyanagar Campus, Mysuru Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      timezone: 'Asia/Kolkata',
    },
    create: {
      name: 'Sri Venkateshwara Institute of Technology',
      code: 'SVIT',
      address: 'Vidyanagar Campus, Mysuru Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      timezone: 'Asia/Kolkata',
    },
  });

  const admin = await upsertAdminProfile({
    email: 'admin@svit.edu',
    firstName: 'System',
    lastName: 'Admin',
    employeeId: 'ADM-001',
    schoolId: school.id,
    phone: '9000000001',
    passwordHash,
  });

  const academicYear = await prisma.academicYear.upsert({
    where: { schoolId_name: { schoolId: school.id, name: ACTIVE_YEAR_NAME } },
    update: {
      startYear: 2026,
      endYear: 2027,
      isActive: true,
    },
    create: {
      schoolId: school.id,
      name: ACTIVE_YEAR_NAME,
      startYear: 2026,
      endYear: 2027,
      isActive: true,
    },
  });

  const departmentMap = new Map<string, Awaited<ReturnType<typeof prisma.department.upsert>>>();
  for (const department of departments) {
    const record = await prisma.department.upsert({
      where: { schoolId_code: { schoolId: school.id, code: department.code } },
      update: {
        name: department.name,
        shortName: department.shortName,
        schemeLabel: department.schemeLabel,
      },
      create: {
        schoolId: school.id,
        code: department.code,
        name: department.name,
        shortName: department.shortName,
        schemeLabel: department.schemeLabel,
      },
    });
    departmentMap.set(department.code, record);
  }

  const semesterMap = new Map<string, Awaited<ReturnType<typeof prisma.semester.upsert>>>();
  for (const department of departments) {
    const departmentRecord = departmentMap.get(department.code)!;

    for (let semesterNumber = 1; semesterNumber <= 8; semesterNumber += 1) {
      const semester = await prisma.semester.upsert({
        where: {
          departmentId_academicYearId_number: {
            departmentId: departmentRecord.id,
            academicYearId: academicYear.id,
            number: semesterNumber,
          },
        },
        update: {
          label: `Semester ${semesterNumber}`,
          status:
            department.code === 'CSE' && semesterNumber === 3
              ? SemesterStatus.ACTIVE
              : semesterNumber < 3
                ? SemesterStatus.COMPLETED
                : SemesterStatus.PLANNED,
        },
        create: {
          schoolId: school.id,
          departmentId: departmentRecord.id,
          academicYearId: academicYear.id,
          number: semesterNumber,
          label: `Semester ${semesterNumber}`,
          status:
            department.code === 'CSE' && semesterNumber === 3
              ? SemesterStatus.ACTIVE
              : semesterNumber < 3
                ? SemesterStatus.COMPLETED
                : SemesterStatus.PLANNED,
        },
      });

      semesterMap.set(`${department.code}-${semesterNumber}`, semester);
    }
  }

  const classMap = new Map<string, Awaited<ReturnType<typeof prisma.academicClass.upsert>>>();
  const sectionMap = new Map<string, Awaited<ReturnType<typeof prisma.section.upsert>>>();

  for (const department of departments) {
    const departmentRecord = departmentMap.get(department.code)!;

    for (let year = 1; year <= 4; year += 1) {
      const className = `${department.code} Year ${year}`;
      const academicClass = await prisma.academicClass.upsert({
        where: { schoolId_name: { schoolId: school.id, name: className } },
        update: { gradeLevel: year },
        create: {
          schoolId: school.id,
          name: className,
          gradeLevel: year,
        },
      });

      classMap.set(className, academicClass);

      const semesterNumber = year * 2 - 1;
      const semester = semesterMap.get(`${department.code}-${semesterNumber}`)!;

      for (const sectionName of year <= 2 ? ['A', 'B'] : ['A']) {
        const section = await prisma.section.upsert({
          where: { classId_name: { classId: academicClass.id, name: sectionName } },
          update: {
            schoolId: school.id,
            departmentId: departmentRecord.id,
            semesterId: semester.id,
            semesterNumber,
            roomLabel: `${department.code}-B${year}${sectionName}`,
          },
          create: {
            schoolId: school.id,
            classId: academicClass.id,
            departmentId: departmentRecord.id,
            semesterId: semester.id,
            semesterNumber,
            name: sectionName,
            roomLabel: `${department.code}-B${year}${sectionName}`,
          },
        });

        sectionMap.set(`${department.code}-${year}-${sectionName}`, section);
      }
    }
  }

  const termMap = new Map<string, Awaited<ReturnType<typeof prisma.academicTerm.upsert>>>();
  for (const [className, academicClass] of classMap.entries()) {
    const term = await prisma.academicTerm.upsert({
      where: {
        schoolId_classId_name: {
          schoolId: school.id,
          classId: academicClass.id,
          name: ACTIVE_TERM_NAME,
        },
      },
      update: {
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        endDate: new Date('2026-12-15T00:00:00.000Z'),
        isActive: className === 'CSE Year 2',
      },
      create: {
        schoolId: school.id,
        classId: academicClass.id,
        name: ACTIVE_TERM_NAME,
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        endDate: new Date('2026-12-15T00:00:00.000Z'),
        isActive: className === 'CSE Year 2',
      },
    });

    termMap.set(className, term);
  }

  const subjectMap = new Map<string, Awaited<ReturnType<typeof prisma.subject.upsert>>>();
  for (const department of departments) {
    const departmentRecord = departmentMap.get(department.code)!;
    for (const [semesterNumberText, subjects] of Object.entries(semesterSubjects)) {
      const semesterNumber = Number(semesterNumberText);
      for (const subject of subjects) {
        const code = `${department.code}${semesterNumber}${subject.code}`;
        const record = await prisma.subject.upsert({
          where: { schoolId_code: { schoolId: school.id, code } },
          update: {
            departmentId: departmentRecord.id,
            name: subject.name,
            description: `${department.name} semester ${semesterNumber} subject.`,
            subjectType: subject.type,
            credits: subject.credits,
            lectureHours: subject.lectureHours,
            practicalHours: subject.practicalHours,
            schemeVersion: department.schemeLabel,
            isElective: subject.type === SubjectType.ELECTIVE,
          },
          create: {
            schoolId: school.id,
            departmentId: departmentRecord.id,
            code,
            name: subject.name,
            description: `${department.name} semester ${semesterNumber} subject.`,
            subjectType: subject.type,
            credits: subject.credits,
            lectureHours: subject.lectureHours,
            practicalHours: subject.practicalHours,
            schemeVersion: department.schemeLabel,
            isElective: subject.type === SubjectType.ELECTIVE,
          },
        });
        subjectMap.set(`${department.code}-${semesterNumber}-${subject.name}`, record);
      }
    }
  }

  const cseDepartment = departmentMap.get('CSE')!;
  const cseSemester3 = semesterMap.get('CSE-3')!;
  const cseYear2 = classMap.get('CSE Year 2')!;
  const cseSectionA = sectionMap.get('CSE-2-A')!;
  const cseSectionB = sectionMap.get('CSE-2-B')!;
  const cseTerm = termMap.get('CSE Year 2')!;

  const teachers = await Promise.all([
    upsertTeacherProfile({
      email: 'teacher@svit.edu',
      firstName: 'Anita',
      lastName: 'Sharma',
      employeeId: 'TCH-CSE-001',
      schoolId: school.id,
      departmentId: cseDepartment.id,
      phone: '9000000002',
      aadhaarNumber: '900100200300',
      designation: 'Assistant Professor',
      qualification: 'M.Tech',
      specialization: 'Discrete Mathematics',
      address: 'Faculty Quarters A-12',
      passwordHash,
    }),
    upsertTeacherProfile({
      email: 'pradeep.nair@svit.edu',
      firstName: 'Pradeep',
      lastName: 'Nair',
      employeeId: 'TCH-CSE-002',
      schoolId: school.id,
      departmentId: cseDepartment.id,
      phone: '9000000003',
      aadhaarNumber: '900100200301',
      designation: 'Associate Professor',
      qualification: 'M.Tech',
      specialization: 'Data Structures',
      address: 'Faculty Quarters A-14',
      passwordHash,
    }),
    upsertTeacherProfile({
      email: 'meera.joshi@svit.edu',
      firstName: 'Meera',
      lastName: 'Joshi',
      employeeId: 'TCH-CSE-003',
      schoolId: school.id,
      departmentId: cseDepartment.id,
      phone: '9000000004',
      aadhaarNumber: '900100200302',
      designation: 'Assistant Professor',
      qualification: 'M.Tech',
      specialization: 'Programming Laboratory',
      address: 'Faculty Quarters A-15',
      passwordHash,
    }),
    upsertTeacherProfile({
      email: 'ece.hod@svit.edu',
      firstName: 'Sonal',
      lastName: 'Rao',
      employeeId: 'TCH-ECE-001',
      schoolId: school.id,
      departmentId: departmentMap.get('ECE')!.id,
      phone: '9000000005',
      aadhaarNumber: '900100200303',
      designation: 'Professor',
      qualification: 'PhD',
      specialization: 'Embedded Systems',
      address: 'Faculty Quarters B-01',
      passwordHash,
    }),
  ]);

  const teacherByEmail = new Map<string, (typeof teachers)[number]>();
  for (const teacher of teachers) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: teacher.userId },
      select: { email: true },
    });
    teacherByEmail.set(user.email, teacher);
  }

  const internalPolicy =
    (await prisma.internalMarksPolicy.findFirst({
      where: {
        schoolId: school.id,
        departmentId: cseDepartment.id,
        semesterId: cseSemester3.id,
        name: 'CSE Semester 3 Internal 50',
      },
      include: { components: { orderBy: { displayOrder: 'asc' } } },
    })) ??
    (await prisma.internalMarksPolicy.create({
      data: {
        schoolId: school.id,
        departmentId: cseDepartment.id,
        academicYearId: academicYear.id,
        semesterId: cseSemester3.id,
        name: 'CSE Semester 3 Internal 50',
        totalMarks: 50,
        attendanceThreshold: 75,
        attendanceBonusMarks: 2,
        components: {
          create: [
            { code: 'IA1', name: 'Internal Assessment 1', maxMarks: 20, displayOrder: 1 },
            { code: 'IA2', name: 'Internal Assessment 2', maxMarks: 15, displayOrder: 2 },
            { code: 'ASSIGN', name: 'Assignment', maxMarks: 5, displayOrder: 3 },
            { code: 'QUIZ', name: 'Quiz', maxMarks: 5, displayOrder: 4 },
            { code: 'PRES', name: 'Presentation', maxMarks: 5, displayOrder: 5 },
          ],
        },
      },
      include: { components: { orderBy: { displayOrder: 'asc' } } },
    }));

  const cseSubjectsForTesting = [
    subjectMap.get('CSE-3-Discrete Mathematical Structures')!,
    subjectMap.get('CSE-3-Data Structures and Applications')!,
    subjectMap.get('CSE-3-Data Structures Laboratory')!,
    subjectMap.get('CSE-3-Universal Human Values')!,
  ];

  const subjectOfferingMap = new Map<string, Awaited<ReturnType<typeof prisma.subjectOffering.upsert>>>();
  for (const subject of cseSubjectsForTesting) {
    const offering = await prisma.subjectOffering.upsert({
      where: {
        semesterId_sectionId_subjectId: {
          semesterId: cseSemester3.id,
          sectionId: cseSectionA.id,
          subjectId: subject.id,
        },
      },
      update: {
        schoolId: school.id,
        departmentId: cseDepartment.id,
        academicYearId: academicYear.id,
        internalMarksPolicyId: internalPolicy.id,
        totalInternalMarks: 50,
        isActive: true,
      },
      create: {
        schoolId: school.id,
        departmentId: cseDepartment.id,
        academicYearId: academicYear.id,
        semesterId: cseSemester3.id,
        sectionId: cseSectionA.id,
        subjectId: subject.id,
        internalMarksPolicyId: internalPolicy.id,
        totalInternalMarks: 50,
      },
    });
    subjectOfferingMap.set(subject.name, offering);
  }

  const assignmentSpecs = [
    {
      teacher: teacherByEmail.get('teacher@svit.edu')!,
      subject: cseSubjectsForTesting[0],
      isClassLead: true,
    },
    {
      teacher: teacherByEmail.get('pradeep.nair@svit.edu')!,
      subject: cseSubjectsForTesting[1],
      isClassLead: false,
    },
    {
      teacher: teacherByEmail.get('meera.joshi@svit.edu')!,
      subject: cseSubjectsForTesting[2],
      isClassLead: false,
    },
    {
      teacher: teacherByEmail.get('teacher@svit.edu')!,
      subject: cseSubjectsForTesting[3],
      isClassLead: false,
    },
  ];

  for (const assignmentSpec of assignmentSpecs) {
    await prisma.teacherSubjectAssignment.upsert({
      where: {
        teacherId_sectionId_subjectId: {
          teacherId: assignmentSpec.teacher.id,
          sectionId: cseSectionA.id,
          subjectId: assignmentSpec.subject.id,
        },
      },
      update: {
        schoolId: school.id,
        classId: cseYear2.id,
        subjectOfferingId: subjectOfferingMap.get(assignmentSpec.subject.name)?.id,
        isClassLead: assignmentSpec.isClassLead,
      },
      create: {
        schoolId: school.id,
        teacherId: assignmentSpec.teacher.id,
        classId: cseYear2.id,
        sectionId: cseSectionA.id,
        subjectId: assignmentSpec.subject.id,
        subjectOfferingId: subjectOfferingMap.get(assignmentSpec.subject.name)?.id,
        isClassLead: assignmentSpec.isClassLead,
      },
    });
  }

  await prisma.teacherSubjectAssignment.upsert({
    where: {
      teacherId_sectionId_subjectId: {
        teacherId: teacherByEmail.get('pradeep.nair@svit.edu')!.id,
        sectionId: cseSectionB.id,
        subjectId: cseSubjectsForTesting[1].id,
      },
    },
    update: {
      schoolId: school.id,
      classId: cseYear2.id,
      isClassLead: false,
    },
    create: {
      schoolId: school.id,
      teacherId: teacherByEmail.get('pradeep.nair@svit.edu')!.id,
      classId: cseYear2.id,
      sectionId: cseSectionB.id,
      subjectId: cseSubjectsForTesting[1].id,
      isClassLead: false,
    },
  });

  const students = await Promise.all([
    upsertStudentProfile({
      email: 'student@svit.edu',
      firstName: 'Rahul',
      lastName: 'Reddy',
      schoolId: school.id,
      sectionId: cseSectionA.id,
      departmentId: cseDepartment.id,
      admissionNo: 'SVIT-2026-CSE-001',
      rollNumber: 'CSE3A01',
      usn: '1SV26CS001',
      phone: '9100000001',
      aadhaarNumber: '800100200301',
      course: 'B.E. Computer Science and Engineering',
      currentYear: 2,
      currentSemester: 3,
      batchStartYear: 2025,
      gender: 'Male',
      fatherName: 'Suresh Reddy',
      motherName: 'Lakshmi Reddy',
      parentPhone: '9876543210',
      guardianName: 'Suresh Reddy',
      guardianPhone: '9876543210',
      address: 'Mysuru Main Road, Bengaluru',
      passwordHash,
    }),
    upsertStudentProfile({
      email: 'sneha.kulkarni@svit.edu',
      firstName: 'Sneha',
      lastName: 'Kulkarni',
      schoolId: school.id,
      sectionId: cseSectionA.id,
      departmentId: cseDepartment.id,
      admissionNo: 'SVIT-2026-CSE-002',
      rollNumber: 'CSE3A02',
      usn: '1SV26CS002',
      phone: '9100000002',
      aadhaarNumber: '800100200302',
      course: 'B.E. Computer Science and Engineering',
      currentYear: 2,
      currentSemester: 3,
      batchStartYear: 2025,
      gender: 'Female',
      fatherName: 'Mahesh Kulkarni',
      motherName: 'Kavya Kulkarni',
      parentPhone: '9876543211',
      guardianName: 'Mahesh Kulkarni',
      guardianPhone: '9876543211',
      address: 'Banashankari, Bengaluru',
      passwordHash,
    }),
    upsertStudentProfile({
      email: 'arjun.patil@svit.edu',
      firstName: 'Arjun',
      lastName: 'Patil',
      schoolId: school.id,
      sectionId: cseSectionA.id,
      departmentId: cseDepartment.id,
      admissionNo: 'SVIT-2026-CSE-003',
      rollNumber: 'CSE3A03',
      usn: '1SV26CS003',
      phone: '9100000003',
      aadhaarNumber: '800100200303',
      course: 'B.E. Computer Science and Engineering',
      currentYear: 2,
      currentSemester: 3,
      batchStartYear: 2025,
      gender: 'Male',
      fatherName: 'Ramesh Patil',
      motherName: 'Deepa Patil',
      parentPhone: '9876543212',
      guardianName: 'Ramesh Patil',
      guardianPhone: '9876543212',
      address: 'Rajajinagar, Bengaluru',
      passwordHash,
    }),
    upsertStudentProfile({
      email: 'nisha.gowda@svit.edu',
      firstName: 'Nisha',
      lastName: 'Gowda',
      schoolId: school.id,
      sectionId: cseSectionA.id,
      departmentId: cseDepartment.id,
      admissionNo: 'SVIT-2026-CSE-004',
      rollNumber: 'CSE3A04',
      usn: '1SV26CS004',
      phone: '9100000004',
      aadhaarNumber: '800100200304',
      course: 'B.E. Computer Science and Engineering',
      currentYear: 2,
      currentSemester: 3,
      batchStartYear: 2025,
      gender: 'Female',
      fatherName: 'Shivakumar Gowda',
      motherName: 'Vidya Gowda',
      parentPhone: '9876543213',
      guardianName: 'Shivakumar Gowda',
      guardianPhone: '9876543213',
      address: 'Kengeri, Bengaluru',
      passwordHash,
    }),
  ]);

  await Promise.all(
    students.map((student, index) =>
      ensureStudentProfileDetails(student.id, `parent${index + 1}@mail.com`),
    ),
  );

  for (const student of students) {
    await prisma.enrollment.upsert({
      where: {
        studentId_termId: {
          studentId: student.id,
          termId: cseTerm.id,
        },
      },
      update: {
        sectionId: cseSectionA.id,
      },
      create: {
        studentId: student.id,
        sectionId: cseSectionA.id,
        termId: cseTerm.id,
      },
    });
  }

  const attendancePlan = [
    { date: '2026-07-08', slotNumber: 1, subject: cseSubjectsForTesting[0], teacher: teacherByEmail.get('teacher@svit.edu')!, statuses: [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.PRESENT] },
    { date: '2026-07-08', slotNumber: 2, subject: cseSubjectsForTesting[1], teacher: teacherByEmail.get('pradeep.nair@svit.edu')!, statuses: [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT] },
    { date: '2026-07-08', slotNumber: 3, subject: cseSubjectsForTesting[2], teacher: teacherByEmail.get('meera.joshi@svit.edu')!, statuses: [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT] },
    { date: '2026-07-09', slotNumber: 1, subject: cseSubjectsForTesting[0], teacher: teacherByEmail.get('teacher@svit.edu')!, statuses: [AttendanceStatus.ABSENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT] },
    { date: '2026-07-09', slotNumber: 2, subject: cseSubjectsForTesting[1], teacher: teacherByEmail.get('pradeep.nair@svit.edu')!, statuses: [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT] },
    { date: '2026-07-09', slotNumber: 4, subject: cseSubjectsForTesting[3], teacher: teacherByEmail.get('teacher@svit.edu')!, statuses: [AttendanceStatus.PRESENT, AttendanceStatus.EXCUSED, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT] },
    { date: '2026-07-10', slotNumber: 1, subject: cseSubjectsForTesting[0], teacher: teacherByEmail.get('teacher@svit.edu')!, statuses: [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT] },
    { date: '2026-07-10', slotNumber: 2, subject: cseSubjectsForTesting[1], teacher: teacherByEmail.get('pradeep.nair@svit.edu')!, statuses: [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT] },
  ];

  for (const sessionSeed of attendancePlan) {
    const subjectOffering = subjectOfferingMap.get(sessionSeed.subject.name)!;
    const session = await prisma.attendanceSession.upsert({
      where: {
        sectionId_subjectId_date_slotNumber: {
          sectionId: cseSectionA.id,
          subjectId: sessionSeed.subject.id,
          date: new Date(`${sessionSeed.date}T00:00:00.000Z`),
          slotNumber: sessionSeed.slotNumber,
        },
      },
      update: {
        teacherId: sessionSeed.teacher.id,
        subjectOfferingId: subjectOffering.id,
        termId: cseTerm.id,
        hourLabel: `Hour ${sessionSeed.slotNumber}`,
        submittedAt: new Date(`${sessionSeed.date}T10:00:00.000Z`),
        topic: `${sessionSeed.subject.name} - Session ${sessionSeed.slotNumber}`,
      },
      create: {
        sectionId: cseSectionA.id,
        subjectId: sessionSeed.subject.id,
        teacherId: sessionSeed.teacher.id,
        subjectOfferingId: subjectOffering.id,
        termId: cseTerm.id,
        date: new Date(`${sessionSeed.date}T00:00:00.000Z`),
        slotNumber: sessionSeed.slotNumber,
        hourLabel: `Hour ${sessionSeed.slotNumber}`,
        submittedAt: new Date(`${sessionSeed.date}T10:00:00.000Z`),
        topic: `${sessionSeed.subject.name} - Session ${sessionSeed.slotNumber}`,
      },
    });

    for (let index = 0; index < students.length; index += 1) {
      await prisma.attendance.upsert({
        where: {
          attendanceSessionId_studentId: {
            attendanceSessionId: session.id,
            studentId: students[index].id,
          },
        },
        update: {
          status: sessionSeed.statuses[index],
          markedAt: new Date(`${sessionSeed.date}T10:05:00.000Z`),
        },
        create: {
          attendanceSessionId: session.id,
          studentId: students[index].id,
          status: sessionSeed.statuses[index],
          markedAt: new Date(`${sessionSeed.date}T10:05:00.000Z`),
        },
      });
    }
  }

  const timetableSeeds = [
    { dayOfWeek: 1, periodLabel: 'Period 1', startTime: '09:00', endTime: '09:55', roomLabel: 'LH-301', subject: cseSubjectsForTesting[0], teacher: teacherByEmail.get('teacher@svit.edu')! },
    { dayOfWeek: 1, periodLabel: 'Period 2', startTime: '10:00', endTime: '10:55', roomLabel: 'LH-301', subject: cseSubjectsForTesting[1], teacher: teacherByEmail.get('pradeep.nair@svit.edu')! },
    { dayOfWeek: 1, periodLabel: 'Period 3', startTime: '11:10', endTime: '12:05', roomLabel: 'LAB-4', subject: cseSubjectsForTesting[2], teacher: teacherByEmail.get('meera.joshi@svit.edu')! },
    { dayOfWeek: 2, periodLabel: 'Period 1', startTime: '09:00', endTime: '09:55', roomLabel: 'LH-301', subject: cseSubjectsForTesting[0], teacher: teacherByEmail.get('teacher@svit.edu')! },
    { dayOfWeek: 2, periodLabel: 'Period 2', startTime: '10:00', endTime: '10:55', roomLabel: 'LH-302', subject: cseSubjectsForTesting[1], teacher: teacherByEmail.get('pradeep.nair@svit.edu')! },
    { dayOfWeek: 2, periodLabel: 'Period 4', startTime: '13:00', endTime: '13:55', roomLabel: 'Seminar Hall', subject: cseSubjectsForTesting[3], teacher: teacherByEmail.get('teacher@svit.edu')! },
    { dayOfWeek: 3, periodLabel: 'Period 1', startTime: '09:00', endTime: '09:55', roomLabel: 'LH-301', subject: cseSubjectsForTesting[0], teacher: teacherByEmail.get('teacher@svit.edu')! },
    { dayOfWeek: 3, periodLabel: 'Period 2', startTime: '10:00', endTime: '10:55', roomLabel: 'LH-302', subject: cseSubjectsForTesting[1], teacher: teacherByEmail.get('pradeep.nair@svit.edu')! },
  ];

  for (const entry of timetableSeeds) {
    const offering = subjectOfferingMap.get(entry.subject.name)!;
    const existing = await prisma.timetableEntry.findFirst({
      where: {
        sectionId: cseSectionA.id,
        subjectId: entry.subject.id,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
      },
    });

    if (existing) {
      await prisma.timetableEntry.update({
        where: { id: existing.id },
        data: {
          teacherId: entry.teacher.id,
          subjectOfferingId: offering.id,
          periodLabel: entry.periodLabel,
          endTime: entry.endTime,
          roomLabel: entry.roomLabel,
          teacherName: `${entry.teacher.firstName} ${entry.teacher.lastName}`,
        },
      });
    } else {
      await prisma.timetableEntry.create({
        data: {
          sectionId: cseSectionA.id,
          subjectId: entry.subject.id,
          teacherId: entry.teacher.id,
          subjectOfferingId: offering.id,
          dayOfWeek: entry.dayOfWeek,
          periodLabel: entry.periodLabel,
          startTime: entry.startTime,
          endTime: entry.endTime,
          roomLabel: entry.roomLabel,
          teacherName: `${entry.teacher.firstName} ${entry.teacher.lastName}`,
        },
      });
    }
  }

  const assessmentMatrix = [
    {
      subject: cseSubjectsForTesting[0],
      assessments: [
        { title: 'IA1 - Discrete Mathematics', type: AssessmentType.INTERNAL, maxMarks: 20, componentCode: 'IA1', scores: [18, 17, 14, 16] },
        { title: 'Assignment 1 - Sets and Relations', type: AssessmentType.ASSIGNMENT, maxMarks: 5, componentCode: 'ASSIGN', scores: [5, 4, 3, 4] },
      ],
      finalMarks: [44, 41, 35, 39],
      examScores: [82, 78, 68, 74],
    },
    {
      subject: cseSubjectsForTesting[1],
      assessments: [
        { title: 'Quiz 1 - Arrays and Linked Lists', type: AssessmentType.QUIZ, maxMarks: 10, componentCode: 'QUIZ', scores: [9, 8, 7, 8] },
        { title: 'IA1 - Data Structures', type: AssessmentType.INTERNAL, maxMarks: 20, componentCode: 'IA1', scores: [17, 16, 15, 16] },
      ],
      finalMarks: [42, 39, 37, 40],
      examScores: [80, 76, 72, 78],
    },
    {
      subject: cseSubjectsForTesting[2],
      assessments: [
        { title: 'Lab Cycle 1', type: AssessmentType.PRACTICAL, maxMarks: 20, componentCode: 'IA1', scores: [19, 18, 16, 17] },
      ],
      finalMarks: [46, 44, 40, 42],
      examScores: [86, 84, 79, 81],
    },
  ];

  for (const subjectPlan of assessmentMatrix) {
    const subjectOffering = subjectOfferingMap.get(subjectPlan.subject.name)!;
    for (const assessmentSeed of subjectPlan.assessments) {
      const component = internalPolicy.components.find((item) => item.code === assessmentSeed.componentCode) ?? null;
      const assessment =
        (await prisma.assessment.findFirst({
          where: {
            subjectId: subjectPlan.subject.id,
            termId: cseTerm.id,
            title: assessmentSeed.title,
          },
        })) ??
        (await prisma.assessment.create({
          data: {
            subjectId: subjectPlan.subject.id,
            termId: cseTerm.id,
            subjectOfferingId: subjectOffering.id,
            componentId: component?.id,
            title: assessmentSeed.title,
            type: assessmentSeed.type,
            maxMarks: assessmentSeed.maxMarks,
            weightage: assessmentSeed.maxMarks,
            scheduledFor: new Date('2026-07-15T00:00:00.000Z'),
          },
        }));

      for (let index = 0; index < students.length; index += 1) {
        const score = assessmentSeed.scores[index];
        const grade = score >= assessmentSeed.maxMarks * 0.85 ? 'A' : score >= assessmentSeed.maxMarks * 0.7 ? 'B' : 'C';

        await prisma.mark.upsert({
          where: {
            assessmentId_studentId: {
              assessmentId: assessment.id,
              studentId: students[index].id,
            },
          },
          update: {
            marksObtained: score,
            grade,
            remark: grade === 'A' ? 'Strong performance' : 'Keep improving problem solving speed',
          },
          create: {
            assessmentId: assessment.id,
            studentId: students[index].id,
            marksObtained: score,
            grade,
            remark: grade === 'A' ? 'Strong performance' : 'Keep improving problem solving speed',
          },
        });
      }
    }

    for (let index = 0; index < students.length; index += 1) {
      await prisma.finalInternalMark.upsert({
        where: {
          studentId_subjectOfferingId: {
            studentId: students[index].id,
            subjectOfferingId: subjectOffering.id,
          },
        },
        update: {
          totalMarks: subjectPlan.finalMarks[index],
          outOfMarks: 50,
          remark: subjectPlan.finalMarks[index] < 40 ? 'Needs stronger consistency' : 'Steady internal performance',
        },
        create: {
          studentId: students[index].id,
          subjectOfferingId: subjectOffering.id,
          totalMarks: subjectPlan.finalMarks[index],
          outOfMarks: 50,
          remark: subjectPlan.finalMarks[index] < 40 ? 'Needs stronger consistency' : 'Steady internal performance',
        },
      });

      await prisma.semesterExamResult.upsert({
        where: {
          studentId_semesterId_subjectId: {
            studentId: students[index].id,
            semesterId: cseSemester3.id,
            subjectId: subjectPlan.subject.id,
          },
        },
        update: {
          subjectOfferingId: subjectOffering.id,
          marksObtained: subjectPlan.examScores[index],
          maxMarks: 100,
          grade: subjectPlan.examScores[index] >= 85 ? 'S' : subjectPlan.examScores[index] >= 75 ? 'A' : 'B',
          resultStatus: ResultStatus.PASS,
        },
        create: {
          studentId: students[index].id,
          semesterId: cseSemester3.id,
          subjectId: subjectPlan.subject.id,
          subjectOfferingId: subjectOffering.id,
          marksObtained: subjectPlan.examScores[index],
          maxMarks: 100,
          grade: subjectPlan.examScores[index] >= 85 ? 'S' : subjectPlan.examScores[index] >= 75 ? 'A' : 'B',
          resultStatus: ResultStatus.PASS,
        },
      });
    }
  }

  const remarkSeeds = [
    {
      teacher: teacherByEmail.get('teacher@svit.edu')!,
      student: students[0],
      title: 'Internal Progress',
      content: 'Excellent analytical thinking. Focus on writing compact proofs.',
    },
    {
      teacher: teacherByEmail.get('pradeep.nair@svit.edu')!,
      student: students[1],
      title: 'Data Structures Follow-up',
      content: 'Good logic and debugging discipline. Practice recursion problems weekly.',
    },
  ];

  for (const remark of remarkSeeds) {
    const existing = await prisma.performanceRemark.findFirst({
      where: {
        studentId: remark.student.id,
        teacherId: remark.teacher.id,
        title: remark.title,
      },
    });

    if (!existing) {
      await prisma.performanceRemark.create({
        data: {
          studentId: remark.student.id,
          teacherId: remark.teacher.id,
          semesterId: cseSemester3.id,
          title: remark.title,
          content: remark.content,
        },
      });
    }

    const existingStudentRemark = await prisma.studentRemark.findFirst({
      where: {
        studentId: remark.student.id,
        teacherId: remark.teacher.id,
        content: remark.content,
      },
    });

    if (!existingStudentRemark) {
      await prisma.studentRemark.create({
        data: {
          studentId: remark.student.id,
          teacherId: remark.teacher.id,
          termId: cseTerm.id,
          content: remark.content,
        },
      });
    }
  }

  const announcementSeeds = [
    {
      title: 'CIE Schedule Released',
      content: 'Internal Assessment 1 for semester 3 begins from July 15. Check subject-wise seating details.',
      audience: AnnouncementAudience.SCHOOL,
      teacherId: null,
      sectionId: null,
      audienceRole: null,
    },
    {
      title: 'Data Structures Lab Submission',
      content: 'Lab cycle 1 record submission closes on Friday 4 PM for CSE semester 3 section A.',
      audience: AnnouncementAudience.SECTION,
      teacherId: teacherByEmail.get('meera.joshi@svit.edu')!.id,
      sectionId: cseSectionA.id,
      audienceRole: null,
    },
    {
      title: 'Attendance Advisory',
      content: 'Students below 75% attendance must meet the class coordinator by Monday.',
      audience: AnnouncementAudience.ROLE,
      teacherId: teacherByEmail.get('teacher@svit.edu')!.id,
      sectionId: null,
      audienceRole: UserRole.STUDENT,
    },
  ];

  for (const announcementSeed of announcementSeeds) {
    const existing = await prisma.announcement.findFirst({
      where: {
        schoolId: school.id,
        title: announcementSeed.title,
      },
    });

    if (!existing) {
      await prisma.announcement.create({
        data: {
          schoolId: school.id,
          teacherId: announcementSeed.teacherId,
          sectionId: announcementSeed.sectionId,
          title: announcementSeed.title,
          content: announcementSeed.content,
          audience: announcementSeed.audience,
          audienceRole: announcementSeed.audienceRole,
          publishedAt: new Date('2026-07-10T09:00:00.000Z'),
        },
      });
    }
  }

  const notificationUsers = await prisma.user.findMany({
    where: {
      email: {
        in: ['student@svit.edu', 'sneha.kulkarni@svit.edu', 'teacher@svit.edu', 'admin@svit.edu'],
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  const notificationMap = new Map(notificationUsers.map((user) => [user.email, user.id]));
  const notifications = [
    {
      email: 'student@svit.edu',
      title: 'New marks uploaded',
      body: 'Your Discrete Mathematics IA1 marks are now available.',
      data: { subject: 'Discrete Mathematical Structures', assessment: 'IA1' },
    },
    {
      email: 'sneha.kulkarni@svit.edu',
      title: 'Attendance warning',
      body: 'Your attendance has moved close to the warning threshold. Attend all upcoming classes.',
      data: { module: 'attendance', severity: 'warning' },
    },
    {
      email: 'teacher@svit.edu',
      title: 'Class advisor reminder',
      body: 'Publish weekly feedback for CSE semester 3 section A before Saturday.',
      data: { module: 'performance' },
    },
    {
      email: 'admin@svit.edu',
      title: 'College dashboard refreshed',
      body: 'Engineering college sample data is ready for admin validation.',
      data: { module: 'admin' },
    },
  ];

  for (const notification of notifications) {
    const userId = notificationMap.get(notification.email);
    if (!userId) {
      continue;
    }

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        title: notification.title,
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
      });
    }
  }

  console.log({
    school: school.name,
    admin: { email: 'admin@svit.edu', password: DEFAULT_PASSWORD, profileId: admin.id },
    teacher: { email: 'teacher@svit.edu', password: DEFAULT_PASSWORD },
    student: { email: 'student@svit.edu', password: DEFAULT_PASSWORD },
    seededDepartments: departments.map((department) => department.code),
    seededStudents: students.length,
    seededTeachers: teachers.length,
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
