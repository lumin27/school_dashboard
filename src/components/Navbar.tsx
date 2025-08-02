import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import React from "react";
import ProfileImage from "./ProfileImage";
import { Prisma } from "@prisma/client";

const Navbar = async () => {
  const user = await currentUser();
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  const query: Prisma.AnnouncementWhereInput = {};
  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  if (role !== "admin") {
    query.OR = [
      { classes: { none: {} } }, // Announcements with no classes (global)
      {
        classes: {
          some: {
            class: roleConditions[role as keyof typeof roleConditions] || {},
          },
        },
      },
    ];
  }

  const newAnnouncements = await prisma.announcement.findMany({
    where: {
      ...query,
      date: {
        gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    orderBy: {
      date: "desc",
    },
    include: {
      classes: {
        include: {
          class: true,
        },
      },
    },
  });

  const newMessages = await prisma.message.findMany({
    where: {
      createdAt: {
        gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      recipients: {
        some: {
          recipientId: user?.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className='flex ictems-center justify-between p-2 lg:p-4 md:mr-4 lg:mr-4'>
      {/* ICONS AND USER*/}

      <div className='flex items-center gap-6 justify-end w-full '>
        <a href='/list/messages'>
          <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative'>
            <Image src='/message.png' alt='message' width={20} height={20} />
            <div
              className={
                newMessages.length > 0
                  ? "absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 rounded-full text-white text-sm"
                  : "hidden"
              }>
              {newMessages.length > 0 && newMessages.length}
            </div>
          </div>
        </a>
        <a href='/list/announcements'>
          <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative'>
            <Image
              src='/announcement.png'
              alt='announcement'
              width={20}
              height={20}
            />
            <div
              className={
                newAnnouncements.length > 0
                  ? "absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 rounded-full text-white text-sm"
                  : "hidden"
              }>
              {newAnnouncements.length > 0 && newAnnouncements.length}
            </div>
          </div>
        </a>
        <div className='flex flex-col'>
          <span className='text-sm leadign-3 font-medium '>
            {user?.username}
          </span>
          <span className='text-[10px] text-gray-500 text-right'>
            {user?.publicMetadata.role as string}
          </span>
        </div>
        {/* <UserButton /> */}
        <div className='cursor-pointer '>
          <ProfileImage src={user?.imageUrl as string} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
