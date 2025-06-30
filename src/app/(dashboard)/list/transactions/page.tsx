import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@/generated/prisma";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type TransactionList = {
  id: number;
  amount: number;
  description: string;
  date: Date;
  type: string;
};

const TransactionListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  const columns = [
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Amount",
      accessor: "amount",
    },
    {
      header: "Description",
      accessor: "description",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: TransactionList) => (
    <tr
      key={item.id}
      className='border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lmPurpleLight'>
      <td className='flex items-center gap-4 p-4 pl-2'>{item.type}</td>
      <td>{item.amount}</td>
      <td className='hidden md:table-cell'>{item.description}</td>
      <td className='hidden md:table-cell'>
        {new Intl.DateTimeFormat("en-US").format(item.date)}{" "}
      </td>
      <td>
        <div className='flex items-center gap-2'>
          {(role === "admin" || role === "accountant") && (
            <>
              <FormContainer table='transaction' type='update' data={item} />
              <FormContainer table='transaction' type='delete' id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, sort, ...queryParams } = await searchParams;
  const orderBy: Prisma.TransactionOrderByWithRelationInput = {
    date: sort === "desc" ? "desc" : "asc",
  };

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.TransactionWhereInput = {};
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.description = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where: query,
      orderBy: orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.transaction.count({ where: query }),
  ]);

  return (
    <div className='bg-white p-4 rounded-md flex-1 m-4 mt-0'>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <h1 className='hidden md:block text-lg font-semibold'>
          All Transactions
        </h1>
        <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>
          <TableSearch />
          <div className='flex items-center gap-4 self-end'>
            <button className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
              <Image src='/filter.png' alt='' width={14} height={14} />
            </button>
            <Link
              href={{
                query: {
                  ...Object.fromEntries(
                    Object.entries((await searchParams) ?? {})
                  ),
                  sort: sort === "desc" ? "asc" : "desc",
                },
              }}
              className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
              <Image src='/sort.png' alt='Sort' width={14} height={14} />
            </Link>
            {role === "admin" && (
              <FormContainer table='transaction' type='create' />
            )}
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

export default TransactionListPage;
