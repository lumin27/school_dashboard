import React from "react";
import AttendanceChart from "./AttendanceChart";
import prisma from "@/lib/prisma";
import AttendanceDetailsButton from "./AttendanceDetailsButton";

const AttendanceChartContainer = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(today);
  lastMonday.setHours(0, 0, 0, 0);
  const now = new Date();
  lastMonday.setDate(today.getDate() - daysSinceMonday);

  const resData = await prisma.attendance.findMany({
    where: {
      date: {
        gte: lastMonday,
        lte: now,
      },
    },
    select: {
      date: true,
      present: true,
    },
  });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const attendanceMap: { [key: string]: { present: number; absent: number } } =
    {
      Sun: { present: 0, absent: 0 },
      Mon: { present: 0, absent: 0 },
      Tue: { present: 0, absent: 0 },
      Wed: { present: 0, absent: 0 },
      Thu: { present: 0, absent: 0 },
      Fri: { present: 0, absent: 0 },
      Sat: { present: 0, absent: 0 },
    };

  resData.forEach((item) => {
    const itemDate = new Date(item.date);
    const localDate = itemDate.getDay();
    const dayName = daysOfWeek[localDate];

    if (item.present) {
      attendanceMap[dayName].present += 1;
    } else {
      attendanceMap[dayName].absent += 1;
    }
  });
  const data = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day]?.present || 0,
    absent: attendanceMap[day]?.absent || 0,
  }));

  return (
    <div className='bg-white rounded-lg p-4 h-full'>
      <div className='flex justify-between items-center'>
        <h1 className='text-lg font-semibold'>Attendance</h1>
        <AttendanceDetailsButton />
      </div>
      <AttendanceChart data={data} />
    </div>
  );
};

export default AttendanceChartContainer;
