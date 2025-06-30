import FilterButton from "@/components/FilterButton";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Lesson, Prisma, Subject, Teacher } from "@/generated/prisma";
import Image from "next/image";
import React from "react";

type LessonList = Lesson & { subject: Subject } & { teacher: Teacher } & {
  class: Class;
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { sessionClaims } = await auth();
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
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "actions",
          },
        ]
      : []),
  ];

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lmPurpleLight'>
      <td className='flex items-center gap-4 p-4 pl-2'>{item.subject.name}</td>
      <td className='md:table-cell'>{item.class.name}</td>
      <td className='hidden md:table-cell'>
        {item.teacher.name + " " + item.teacher.surname}
      </td>
      <td>
        <div className='flex items-center gap-2'>
          {role === "admin" && (
            <>
              <FormContainer table='lesson' type='update' data={item} />
              <FormContainer table='lesson' type='delete' id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = (await searchParams) ?? {};
  const p = Number(page) || 1;

  const query: Prisma.LessonWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = Number(value);
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          case "className":
            query.class = { name: { contains: value, mode: "insensitive" } };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, total] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      skip: (p - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
      include: {
        subject: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
        class: { select: { name: true } },
      },
    }),
    prisma.lesson.count({
      where: query,
    }),
  ]);

  return (
    <div className='p-4 bg-white rounded-md flex-1 m-4 mt-0'>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-semibold hidden md:block'>All Lessons</h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <FilterButton />
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
              <Image src='/sort.png' alt='filter' width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table='lesson' type='create' />}
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

export default LessonListPage;
