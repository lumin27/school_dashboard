import FilterButton from "@/components/FilterButton";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type TeacherList = Teacher & { subjects: Subject[]; classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string } | undefined>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  const columns = [
    {
      header: "Teacher Name",
      accessor: "name",
    },
    {
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      // className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin" ? [{ header: "Actions", accessor: "actions" }] : []),
  ];

  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lmPurpleLight'>
      <td className='flex items-center gap-4 p-4 pl-2'>
        <Image
          src={item.img || "/noAvatar.png"}
          alt={item.name}
          width={40}
          height={40}
          className='md:hidden xl:block w-10 h-10 rounded-full object-cover'
        />
        <div className='flex flex-col'>
          <h3 className='font-semibold max-w-[120px] truncate text-ellipsis whitespace-nowrap overflow-hidden'>
            {item.name + " " + item.surname}
          </h3>
          <h4 className='text-gray-500 text-xs'>{item.email}</h4>
        </div>
      </td>
      <td
        className='hidden md:table-cell max-w-[120px] truncate text-ellipsis whitespace-nowrap overflow-hidden'
        title={item.id}>
        {item.id}
      </td>

      <td className='hidden md:table-cell'>
        {item.subjects.map((subject) => subject.name).join(", ")}
      </td>
      <td>{item.classes.map((cls) => cls.name).join(", ")}</td>
      <td className='hidden lg:table-cell'>{item.phone}</td>
      <td className='hidden lg:table-cell'>{item.address}</td>
      <td>
        <div className='flex items-center gap-2'>
          <Link href={`/list/teachers/${item.id}`}>
            <button className='w-7 h-7 flex items-center justify-center rounded-full bg-lmSky'>
              <Image src='/view.png' alt='filter' width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer
              table='teacher'
              type='delete'
              id={item.id as string}
            />
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = (await searchParams) ?? {};
  const p = Number(page) || 1;

  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== "undefined") {
        switch (key) {
          case "classId": {
            query.lessons = {
              some: {
                classId: Number(value),
              },
            };
            break;
          }
          case "search":
            query.name = {
              contains: value,
              mode: "insensitive",
            };
            break;
          case "className": {
            query.classes = {
              some: {
                name: {
                  contains: value,
                  mode: "insensitive",
                },
              },
            };
            break;
          }
          default:
            break;
        }
      }
    }
  }

  const [data, total] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query || { id: userId },
      skip: (p - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
      include: {
        subjects: true,
        classes: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.teacher.count({
      where: query,
    }),
  ]);

  return (
    <div className='p-4 bg-white rounded-md flex-1 m-4 mt-0'>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-semibold hidden md:block'>All Teachers</h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <FilterButton />
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
              <Image src='/sort.png' alt='filter' width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table='teacher' type='create' />
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

export default TeacherListPage;
