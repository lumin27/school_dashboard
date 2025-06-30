import Image from "next/image";
import React from "react";
import EventList from "./EventList";
import EventCalendar from "./EventCalendar";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { date } = await searchParams;
  return (
    <div className='bg-white p-4 rounded-lg'>
      <EventCalendar />
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-semibold my-2'>Events</h1>
        <a href='/list/events'>
          <Image src='/moreDark.png' alt='more' width={20} height={20} />
        </a>
      </div>
      <div className='flex flex-col gap-4'>
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
