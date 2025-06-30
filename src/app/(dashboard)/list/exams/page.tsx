import FilterButton from "@/components/FilterButton";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Exam, Prisma, Subject, Teacher } from "@/generated/prisma";
import React from "react";

type ExamList = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "actions",
          },
        ]
      : []),
  ];

  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lmPurpleLight'>
      <td className='flex items-center p-4 pl-2'>{item.lesson.subject.name}</td>
      <td>{item.lesson.class.name}</td>
      <td className='hidden md:table-cell'>
        {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
      </td>
      <td className='flex items-center'>
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>
      <td>
        <div className='flex items-center gap-2'>
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table='exam' type='update' data={item} />
              <FormContainer table='exam' type='delete' id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, sort, ...queryParams } = (await searchParams) ?? {};
  const p = Number(page) || 1;
  const orderBy: Prisma.ExamOrderByWithRelationInput = {
    startTime: sort === "desc" ? "desc" : "asc",
  };

  const query: Prisma.ExamWhereInput = {};

  query.lesson = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lesson.classId = Number(value);
            break;
          case "teacherId":
            query.lesson.teacherId = value;
            break;
          case "search":
            query.lesson.subject = {
              name: { contains: value, mode: "insensitive" },
            };
            break;
          case "className":
            query.lesson.class = {
              name: { contains: value, mode: "insensitive" },
            };
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
    case "teacher":
      query.lesson.teacherId = userId!;
      break;
    case "student":
      query.lesson.OR = [{ class: { students: { some: { id: userId! } } } }];
      break;
    case "parent":
      query.lesson.class = {
        students: {
          some: {
            parentId: userId!,
          },
        },
      };
      break;
    default:
      break;
  }

  const [data, total] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      skip: (p - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
      orderBy: orderBy,
      include: {
        lesson: {
          include: {
            subject: { select: { name: true } },
            class: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
          },
        },
      },
    }),
    prisma.exam.count({
      where: query,
    }),
  ]);

  return (
    <div className='p-4 bg-white rounded-md flex-1 m-4 mt-0 '>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-semibold hidden md:block'>All Exams</h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <FilterButton />
            <SortButton field='date' />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table='exam' type='create' />
            )}
          </div>
        </div>
      </div>
      {/* LISTS  */}
      <Table columns={columns} data={data} renderRow={renderRow} />
      {/* PAGINATION  */}
      <Pagination page={p} total={total} />
    </div>
  );
};

export default ExamListPage;
