import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const StudentPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { userId } = await auth();

  const classItem = await prisma.class.findMany({
    where: {
      students: {
        some: {
          id: userId as string,
        },
      },
    },
  });
  return (
    <div className='p-4 flex gap-4 md:flex-row flex-col'>
      {/* LEFT */}
      <div className='w-full lg:w-2/3 flex flex-col gap-6'>
        <div>
          <h1>
            Schedule{" "}
            {classItem.map((item: { id: number; name: string }) => item.name)}
          </h1>
          {classItem.length > 0 ? (
            <BigCalendarContainer type='classId' id={classItem[0].id} />
          ) : (
            <p>No class assigned.</p>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className='w-full lg:w-1/3 flex flex-col gap-8'>
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>{" "}
    </div>
  );
};

export default StudentPage;
