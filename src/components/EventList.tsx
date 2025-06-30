import prisma from "@/lib/prisma";
import React from "react";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  const date = dateParam ? new Date(dateParam) : new Date();
  const data = await prisma.event.findMany({
    where: {
      startTime: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
    orderBy: {
      startTime: "asc",
    },
    take: 5,
  });
  return data.map((event) => (
    <div
      key={event.id}
      className='p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-[#c3ebfa] even:border-t-[#cfceff]'>
      <div className='flex items-center justify-between'>
        <h1 className='font-semibold text-gray-600'>{event.title}</h1>
        <span className='text-gray-300 text-sm mt-2'>
          {event.startTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      </div>
      <p className='mt-2 text-gray-400 text-sm'>{event.description}</p>
    </div>
  ));
};

export default EventList;
