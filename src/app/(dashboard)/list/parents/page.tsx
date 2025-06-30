import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Parent, Prisma, Student } from "@/generated/prisma";
import Image from "next/image";
import React from "react";

type ParentList = Parent & {
  students: Student[];
};

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  const columns = [
    {
      header: "Parent Name",
      accessor: "name",
    },
    {
      header: "Parent ID",
      accessor: "id",
      className: "hidden md:table-cell",
    },
    {
      header: "Student Names",
      accessor: "students",
      className: "hidden md:table-cell",
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

  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lmPurpleLight'>
      <td className='flex items-center gap-4 p-4 pl-2'>
        <div className='flex flex-col'>
          <h3 className='font-semibold'>{item.name + " " + item.surname}</h3>
          <p className='text-gray-500 text-xs'>{item?.email || "-"}</p>
        </div>
      </td>
      <td
        className='hidden md:table-cell max-w-[120px] truncate text-ellipsis whitespace-nowrap overflow-hidden'
        title={item.id}>
        {item.id}
      </td>
      <td className='hidden md:table-cell '>
        <div
          className={`flex ${
            item.students.length > 1 ? "flex-col" : "flex-row"
          } flex-wrap`}>
          {item.students.map((student, index) => (
            <span key={index} className='mr-2'>
              {student.name} {student.surname} Grade-{student.gradeId}
              {index !== item.students.length - 1 ? "," : ""}
            </span>
          ))}
        </div>
      </td>
      <td className='hidden lg:table-cell'>{item.phone}</td>
      <td className='hidden lg:table-cell'>{item.address}</td>
      <td>
        <div className='flex items-center gap-2'>
          {role === "admin" && (
            <>
              <FormContainer
                table='parent'
                type='update'
                data={item}
                id={item.id}
              />
              <FormContainer
                table='parent'
                type='delete'
                data={item}
                id={item.id}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = (await searchParams) ?? {};
  const p = Number(page) || 1;

  let query: Prisma.ParentWhereInput = {};

  if (role === "teacher") {
    query = {
      students: {
        some: { class: { lessons: { some: { teacherId: userId! } } } },
      },
    };
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== "undefined") {
        switch (key) {
          case "search":
            query.name = {
              contains: value,
              mode: "insensitive",
            };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, total] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      skip: (p - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
      include: {
        students: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.parent.count({
      where: query,
    }),
  ]);

  return (
    <div className='p-4 bg-white rounded-md flex-1 m-4 mt-0'>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-semibold hidden md:block'>All Parents</h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
              <Image src='/filter.png' alt='filter' width={14} height={14} />
            </button>
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
              <Image src='/sort.png' alt='filter' width={14} height={14} />
            </button>
            <FormContainer table='parent' type='create' />
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

export default ParentListPage;
