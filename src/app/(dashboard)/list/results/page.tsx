import FilterButton from "@/components/FilterButton";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import React from "react";

type ResultList = {
  id: number;
  title: string;
  className: string;
  teacherName: string;
  teacherSurName: string;
  studentName: string;
  studentSurName: string;
  startTime: Date;
  score: number;
};

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Score",
      accessor: "score",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lmPurpleLight'>
      <td className='flex items-center gap-4 p-4 pl-2'>{item.title}</td>
      <td>{item.studentName + " " + item.studentSurName}</td>
      <td className='flex items-center'>{item.score}</td>
      <td className='hidden md:table-cell text-sm'>
        {item.teacherName + " " + item.teacherSurName}
      </td>
      <td className='hidden md:table-cell'>{item.className}</td>
      <td className='hidden md:table-cell'>
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>
      <td>
        <div className='flex items-center gap-2'>
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table='result' type='update' data={item} />
              <FormContainer table='result' type='delete' id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = (await searchParams) ?? {};
  const p = Number(page) || 1;

  const query: Prisma.ResultWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              {
                student: { name: { contains: value, mode: "insensitive" } },
              },
              {
                student: { surname: { contains: value, mode: "insensitive" } },
              },
              { exam: { title: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS

  switch (role) {
    case "admin":
      break;
    case "student":
      query.studentId = userId!;
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: userId! } } },
        { assignment: { lesson: { teacherId: userId! } } },
      ];
    case "parent":
      query.student = { parentId: userId! };
      break;
    default:
      break;
  }

  const [dataRes, total] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      skip: (p - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
    }),
    prisma.result.count({
      where: query,
    }),
  ]);

  const data = dataRes.map((item) => {
    const assessment = item.exam || item.assignment;

    if (!assessment) return null;

    const isExam = "startTime" in assessment;
    return {
      id: item.id,
      title: assessment.title,
      className: assessment.lesson.class.name,
      teacherName: assessment.lesson.teacher.name,
      teacherSurName: assessment.lesson.teacher.surname,
      studentName: item.student.name,
      studentSurName: item.student.surname,
      startTime: isExam ? assessment.startTime : assessment.startDate,
      score: item.score,
    };
  });

  return (
    <div className='p-4 bg-white rounded-md flex-1 m-4 mt-0'>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <h1 className='hidden md:block text-lg font-semibold'>All Results</h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <FilterButton />
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
              <Image src='/sort.png' alt='filter' width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table='result' type='create' />
            )}
          </div>
        </div>
      </div>
      {/* LISTS  */}
      <Table columns={columns} data={data} renderRow={renderRow} />
      {/* PAGINATION  */}
      <Pagination total={total} page={p} />
    </div>
  );
};

export default ResultListPage;
