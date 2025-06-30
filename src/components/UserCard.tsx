import prisma from "@/lib/prisma";
import Image from "next/image";
import React from "react";

const UserCard = async ({
  type,
}: {
  type: "admin" | "student" | "teacher" | "parent";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    student: prisma.student,
    teacher: prisma.teacher,
    parent: prisma.parent,
  };

  const data = await modelMap[type].count();
  return (
    <div className='rounded-2xl odd:bg-[#cfceff] even:bg-[#fae27c] p-4 flex-1 min-w-[130px]'>
      <div className='flex items-center justify-between '>
        <span className='text-[10px] bg-white py-1 px-2 rounded-full tex-green-500'>
          {new Date().toLocaleDateString()}
        </span>
        {type === "admin" ? (
          <Image src='/more.png' alt='' width={20} height={20} />
        ) : (
          <a href={`/list/${type}s`}>
            <Image
              src='/more.png'
              alt='more'
              width={20}
              height={20}
              className='cursor-pointer'
            />
          </a>
        )}
      </div>
      <h1 className='text-2xl font-semibold my-4'>{data}</h1>
      <h2 className='capitalize text-sm text-gray-500 '>{type + "s"}</h2>
    </div>
  );
};

export default UserCard;
