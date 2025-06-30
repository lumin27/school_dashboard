import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ParentPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { userId } = await auth();

  const students = await prisma.student.findMany({
    where: {
      parentId: userId as string,
    },
  });

  return (
    <div className='p-4 flex gap-4 md:flex-row flex-col'>
      {/* LEFT */}
      <div className='w-full lg:w-2/3 flex flex-col gap-6'>
        {students.map((student) => (
          <div className='w-full xl:w-full' key={student.id}>
            <div className='h-full bg-white p-4 rounded-md'>
              <h1 className='text-xl font-semibold'>
                Schedule ({student.name + " " + student.surname})
              </h1>
              <BigCalendarContainer type='classId' id={student.classId} />
            </div>
          </div>
        ))}
      </div>
      {/* RIGHT */}
      <div className='w-full xl:w-1/3 flex flex-col gap-8'>
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
