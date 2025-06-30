import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const TeacherPage = async () => {
  const { userId } = await auth();
  const lessons = await prisma.lesson.findFirst({
    where: {
      teacherId: userId as string,
    },
    include: {
      subject: true,
      class: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className='p-4 flex gap-4 flex-col md:flex-row'>
      {/* LEFT */}
      <div className='w-full lg:w-2/3 flex flex-col gap-6'>
        <div>
          <h1>Schedule {lessons?.class.name}</h1>
          <BigCalendarContainer type='teacherId' id={userId as string} />
        </div>
      </div>
      {/* RIGHT */}
      <div className='w-full lg:w-1/3 flex flex-col gap-8'>
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;
