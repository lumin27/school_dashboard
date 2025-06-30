import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const Announcements = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: {
      date: "desc",
    },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  return (
    <div className='bg-white rounded-md p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>Announcements</h1>
        <a
          className='text-xs text-gray-400 bg-white rounded-md px-1 py-1 hover:underline cursor-pointer'
          href='/list/announcements'>
          View All
        </a>
      </div>
      <div>
        {data.map((announcement) => (
          <div
            key={announcement.id}
            className='p-5 rounded-md border-2 border-gray-100 odd:bg-[#edf9fd] even:bg-[#f1f0ff] mt-4'>
            <div className='flex items-center justify-between '>
              <h2 className='font-medium'>{announcement.title}</h2>
              <span className='text-xs text-gray-400 bg-white rounded-md px-1 py-1'>
                {announcement.date.toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className='text-sm text-gray-400 mt-1'>
              {announcement.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
