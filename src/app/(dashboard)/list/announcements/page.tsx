import FilterButton from "@/components/FilterButton";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import SortButton from "@/components/SortButton";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Announcement, Class, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }> | undefined;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Classes",
      accessor: "classes",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: Announcement & { classes: { class: Class }[] }) => (
    <tr
      key={item.id}
      className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lmPurpleLight'>
      <td className='flex items-center gap-4 p-4 pl-2'>{item.title}</td>
      <td>
        {item.classes.length > 0
          ? item.classes.map((ac: any) => ac.class.name).join(", ")
          : "-"}
      </td>
      <td className='hidden md:table-cell'>
        {new Intl.DateTimeFormat("en-US").format(item.date)}
      </td>
      <td>
        <div className='flex items-center gap-2'>
          {role === "admin" && (
            <>
              <FormContainer table='announcement' type='update' data={item} />
              <FormContainer table='announcement' type='delete' id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, sort, ...queryParams } = (await searchParams) ?? {};
  const p = Number(page) || 1;
  const orderBy: Prisma.AnnouncementOrderByWithRelationInput = {
    date: sort === "desc" ? "desc" : "asc",
  };

  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== "undefined") {
        switch (key) {
          case "search":
            query.title = {
              contains: value,
              mode: "insensitive",
            };
            break;
          case "className":
            query.classes = {
              some: {
                class: {
                  name: {
                    contains: value,
                    mode: "insensitive",
                  },
                },
              },
            };
            break;
          default:
            break;
        }
      }
    }
  }

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  if (role !== "admin") {
    query.OR = [
      { classes: { none: {} } },
      {
        classes: {
          some: {
            class: roleConditions[role as keyof typeof roleConditions] || {},
          },
        },
      },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      skip: (p - 1) * ITEM_PER_PAGE,
      take: ITEM_PER_PAGE,
      include: {
        classes: {
          include: {
            class: true,
          },
        },
      },
      orderBy: orderBy,
    }),
    prisma.announcement.count({
      where: query,
    }),
  ]);

  return (
    <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0 '>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <h1 className='hidden md:block text-lg font-semibold'>
          All Announcements
        </h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <FilterButton />
            <SortButton field='date' />

            {role === "admin" && (
              <FormContainer table='announcement' type='create' />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination total={total} page={p} />
    </div>
  );
};

export default AnnouncementListPage;
