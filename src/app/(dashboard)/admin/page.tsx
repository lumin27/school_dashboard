import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import UserCard from "@/components/UserCard";
import React from "react";

const AdminPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  return (
    <div className='p-4 flex flex-col md:flex-row gap-4'>
      {/* LEFT */}
      <div className='w-full lg:w-2/3 flex flex-col gap-4'>
        {/* USER CARD */}
        <div className='flex gap-4 justify-between flex-wrap'>
          <UserCard type='student' />
          <UserCard type='teacher' />
          <UserCard type='parent' />
          <UserCard type='admin' />
        </div>
        {/* MIDDLE CHARTS */}
        <div className='flex gap-4 flex-col lg:flex-row'>
          {/* COUNT CHART */}
          <div className='w-full lg:w-1/3 h-[450px]'>
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className='w-full lg:w-2/3 h-[450px]'>
            <AttendanceChartContainer />
          </div>
        </div>
        {/* BOTTOM CHART*/}
        <div className='w-full h-full'>
          <FinanceChartContainer />
        </div>
      </div>
      {/* RIGHT */}
      <div className='w-full lg:w-1/3 flex flex-col gap-4'>
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;
