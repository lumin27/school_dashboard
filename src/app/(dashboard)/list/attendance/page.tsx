import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import AttendanceFormButton from "@/components/AttendanceFormButton";
import { startOfMonth, endOfMonth, format } from "date-fns";
import FilterButton from "@/components/FilterButton";
import TableSearch from "@/components/TableSearch";
import SortButton from "@/components/SortButton";
import { Prisma } from "@prisma/client";

type ClassSummary = {
  [className: string]: {
    [date: string]: {
      [subjectName: string]: {
        presentCount: number;
        absentCount: number;
      };
    };
  };
};

const attendanceWithAll = Prisma.validator<Prisma.AttendanceInclude>()({
  lesson: {
    include: {
      subject: true,
      class: true,
    },
  },
  student: true,
});

type UserRole = "admin" | "teacher" | "student" | "parent" | undefined;

type AttendanceWithAll = Prisma.AttendanceGetPayload<{
  include: typeof attendanceWithAll;
}>;

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role as UserRole;

  const classNameFilter = (await searchParams).className?.toLowerCase() || "";

  if (!userId || !role) {
    return null;
  }
  const orderBy = (await searchParams).sort === "asc" ? "asc" : "desc";

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  // Student Attendance
  const studentAttendance =
    role === "student"
      ? await prisma.attendance.findMany({
          where: {
            studentId: userId!,
            date: { gte: start, lte: end },
          },
          orderBy: { date: orderBy },
          include: {
            lesson: {
              include: { subject: true, class: true },
            },
          },
        })
      : [];

  // Attendance for parent's children
  let studentParentAttendance: AttendanceWithAll[] = [];
  if (role === "parent") {
    const children = await prisma.student.findMany({
      where: { parentId: userId! },
      select: { id: true },
    });
    const studentIds = children.map((child) => child.id);
    studentParentAttendance = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: { gte: start, lte: end },
      },
      orderBy: { date: orderBy },
      include: attendanceWithAll,
    });
  }

  const studentNameFilter =
    (await searchParams).studentName?.toLowerCase() || "";
  const filteredStudentRecords = studentParentAttendance.filter((record) =>
    record.student.name.toLowerCase().includes(studentNameFilter)
  );

  const classSummary: ClassSummary = {};

  if (role === "admin" || role === "teacher") {
    const attendances = await prisma.attendance.findMany({
      where: {
        date: { gte: start, lte: end },
        ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
      include: { lesson: { include: { class: true, subject: true } } },
      orderBy: { date: orderBy },
    });

    attendances.forEach((att) => {
      const className = att.lesson.class.name;
      const subjectName = att.lesson.subject.name;
      const dateStr = format(att.date, "yyyy-MM-dd");

      if (!classSummary[className]) {
        classSummary[className] = {};
      }

      if (!classSummary[className][dateStr]) {
        classSummary[className][dateStr] = {};
      }

      if (!classSummary[className][dateStr][subjectName]) {
        classSummary[className][dateStr][subjectName] = {
          presentCount: 0,
          absentCount: 0,
        };
      }

      const entry = classSummary[className][dateStr][subjectName];

      if (att.present === true) {
        entry.presentCount++;
      } else if (att.present === false) {
        entry.absentCount++;
      }
    });
  }

  const filteredClassSummary = classNameFilter
    ? Object.fromEntries(
        Object.entries(classSummary).filter(([className]) =>
          className.toLowerCase().includes(classNameFilter)
        )
      )
    : classSummary;

  return (
    <div className='container'>
      {(role === "admin" || role === "teacher") && (
        <div className=' bg-white mx-4 p-4 rounded-lg'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-semibold mb-4'>Attendances</h1>
            <div className='flex gap-2 '>
              <FilterButton />
              <SortButton field='date' />
              <AttendanceFormButton userRole={role} userId={userId!} />
            </div>
          </div>
          {Object.keys(filteredClassSummary).length === 0 ? (
            <p className='text-gray-500'>
              No attendance records for this month.
            </p>
          ) : (
            Object.entries(filteredClassSummary).map(([className, dates]) => (
              <div key={className} className='mb-8'>
                <h3 className='text-xl font-semibold mb-2'>
                  Class: {className}
                </h3>
                <table className='min-w-full border-collapse border border-gray-300'>
                  <thead>
                    <tr>
                      <th className='border border-gray-300 p-2 text-center'>
                        Date
                      </th>
                      <th className='border border-gray-300 p-2 text-center w-[30%]'>
                        Subject
                      </th>
                      <th className='border border-gray-300 p-2 text-center'>
                        Present
                      </th>
                      <th className='border border-gray-300 p-2 text-center'>
                        Absent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(dates)
                      .sort(([dateA], [dateB]) =>
                        orderBy === "asc"
                          ? new Date(dateA).getTime() -
                            new Date(dateB).getTime()
                          : new Date(dateB).getTime() -
                            new Date(dateA).getTime()
                      )
                      .map(([date, subjects]) =>
                        Object.entries(subjects).map(
                          ([subjectName, { presentCount, absentCount }]) => (
                            <tr key={`${date}-${subjectName}`}>
                              <td className='border border-gray-300 p-2 text-center'>
                                {date}
                              </td>
                              <td className='border border-gray-300 p-2 text-center'>
                                {subjectName}
                              </td>
                              <td className='border border-gray-300 p-2 text-center'>
                                {presentCount}
                              </td>
                              <td className='border border-gray-300 p-2 text-center'>
                                {absentCount}
                              </td>
                            </tr>
                          )
                        )
                      )}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {role === "student" && (
        <div className=' bg-white mx-4 p-4 rounded-lg'>
          <h2 className='text-lg font-semibold mb-4'>
            Your Attendance Records for this Month
          </h2>
          <ul className='space-y-3'>
            {studentAttendance.length === 0 ? (
              <p className='text-gray-500'>
                No attendance records for this month.
              </p>
            ) : (
              studentAttendance.map((record) => (
                <li
                  key={record.id}
                  className='border rounded-md p-4 shadow-sm bg-white flex justify-between items-center'>
                  <div>
                    <p className='font-medium'>
                      Subject: {record.lesson.subject.name}
                    </p>
                    <p className='text-sm text-gray-600'>
                      Class: {record.lesson.class.name}
                    </p>
                    <p className='text-sm text-gray-600'>
                      Date:{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(record.date))}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      record.present === true
                        ? "bg-green-100 text-green-800"
                        : record.present === false
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {record.present === true ? "Present" : "Absent"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {role === "parent" && (
        <div className=' bg-white mx-4 p-4 rounded-lg'>
          <div className='mb-4 flex flex-col lg:flex-row justify-between gap-2'>
            <h2 className='text-lg font-semibold'>
              Your Child&apos;s Attendance Records for this Month
            </h2>
            <TableSearch
              paramKey='studentName'
              placeholder='Search student name...'
            />
          </div>
          <ul className='space-y-3'>
            {filteredStudentRecords.length === 0 ? (
              <p className='text-gray-500'>
                No attendance records for this month.
              </p>
            ) : (
              filteredStudentRecords.map((record) => (
                <li
                  key={record.id}
                  className='border rounded-md p-4 shadow-sm bg-white flex justify-between items-center'>
                  <div>
                    <p>Student Name: {record.student.name}</p>
                    <p className='font-medium'>
                      Subject: {record.lesson.subject.name}
                    </p>
                    <p className='text-sm text-gray-600'>
                      Class: {record.lesson.class.name}
                    </p>
                    <p className='text-sm text-gray-600'>
                      Date:{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(record.date))}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      record.present === true
                        ? "bg-green-100 text-green-800"
                        : record.present === false
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {record.present === true ? "Present" : "Absent"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
