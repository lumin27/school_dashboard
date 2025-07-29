"use client";

import React from "react";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type FinanceData = {
  name: string;
  income: number;
  expense: number;
}[];

interface FinanceChartProps {
  data: FinanceData;
}

const FinanceChart: React.FC<FinanceChartProps> = ({ data }) => {
  const handleClick = () => {
    window.location.href = "/list/transactions";
  };

  return (
    <div className='bg-white rounded-xl w-full h-full p-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-lg font-semibold'>Finance</h1>
        <Image
          src='/moreDark.png'
          alt='More Options'
          width={20}
          height={20}
          onClick={handleClick}
          className='cursor-pointer'
        />
      </div>
      <ResponsiveContainer width='100%' height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: -45, bottom: 5 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='#ddd' />
          <XAxis
            dataKey='name'
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            tickMargin={10}
          />
          <Tooltip
            contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
          />
          <Legend
            align='center'
            verticalAlign='top'
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Line
            type='monotone'
            dataKey='income'
            stroke='#22c55e'
            strokeWidth={2}
          />
          <Line
            type='monotone'
            dataKey='expense'
            stroke='#ef4444'
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
