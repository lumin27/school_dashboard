import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Grade, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import FormContainer from "@/components/FormContainer";
import SortButton from "@/components/SortButton";

type GradeList = Grade & {
  students: Student[];
  classes: Class[];
};

const GradeListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Grade Level",
      accessor: "name",
    },
    {
      header: "Classes",
      accessor: "classes",
    },
    {
      header: "Students",
      accessor: "students",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
      className: "text-end md:text-center",
    },
  ];

  const renderRow = (item: GradeList) => (
    <tr
      key={item.id}
      className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lmPurpleLight'>
      <td className='flex items-center gap-4 p-4 pl-2'>
        {"Grade " + item.level}
      </td>
      <td>
        {(item.classes.length > 0 &&
          item.classes.map((c) => c.name).join(", ")) ||
          "-"}
      </td>
      <td className='hidden md:table-cell'>{item.students.length}</td>
      <td className='flex md:justify-center justify-end'>
        <div className='flex items-center gap-2'>
          {role === "admin" && (
            <>
              <FormContainer table='grade' type='update' data={item} />
              <FormContainer table='grade' type='delete' id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, sort, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;
  const orderBy: Prisma.GradeOrderByWithRelationInput = {
    level: sort === "desc" ? "desc" : "asc",
  };

  // URL PARAMS CONDITION

  const query: Prisma.GradeWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.level = Number(value);
            break;
          default:
            break;
        }
      }
    }
  }

  const [fetchData, total] = await prisma.$transaction([
    prisma.grade.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy,
    }),
    prisma.grade.count({ where: query }),
  ]);

  // Fetch classes for each grade separately
  const data = await Promise.all(
    fetchData.map(async (grade) => {
      const classes = await prisma.class.findMany({
        where: { gradeId: grade.id },
      });

      const studentCount = await prisma.student.count({
        where: { classId: { in: classes.map((c) => c.id) } },
      });
      return {
        ...grade,
        classes,
        students: new Array(studentCount).fill(null),
      };
    })
  );

  return (
    <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <h1 className='hidden md:block text-lg font-semibold'>Grades</h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
              <Image src='/filter.png' alt='' width={14} height={14} />
            </button>
            <SortButton field='level' />
            {role === "admin" && <FormContainer table='grade' type='create' />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} total={total} />
    </div>
  );
};

export default GradeListPage;
