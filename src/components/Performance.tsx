"use client";

import Image from "next/image";
import React from "react";
import { PieChart, Pie, ResponsiveContainer } from "recharts";

type AttendanceData = {
  total: number;
  present: number;
};

const getChartData = (present: number, total: number) => {
  const percentage = Math.round((present / total) * 100);
  return [
    { name: "Present", value: percentage, fill: "#C3EBFA" },
    { name: "Absent", value: 100 - percentage, fill: "#FAE27C" },
  ];
};

const Performance = ({ attendance }: { attendance: AttendanceData }) => {
  const data = getChartData(attendance.present, attendance.total);
  const score = ((attendance.present / attendance.total) * 10).toFixed(1);

  return (
    <div className='bg-white p-4 rounded-md h-80 relative'>
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-semibold'>Attendance Performance</h1>
        <Image src='/moreDark.png' alt='more' width={16} height={16} />
      </div>
      <ResponsiveContainer>
        <PieChart width={400} height={400}>
          <Pie
            dataKey='value'
            startAngle={180}
            endAngle={0}
            data={data}
            cx='50%'
            cy='50%'
            innerRadius={70}
            label
          />
        </PieChart>
      </ResponsiveContainer>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'>
        <h1 className='text-3xl font-bold'>{score.length > 3 ? score : 0}</h1>
        <p className='text-sm text-gray-300'>of 10 max</p>
      </div>
      <h2 className='font-medium absolute bottom-16 left-0 right-0 m-auto text-center'>
        This Semester
      </h2>
    </div>
  );
};

export default Performance;
