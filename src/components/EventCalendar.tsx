"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];
const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());
  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      router.push(`?date=${value}`);
    }
  }, [value, router]);

  return (
    <div className='bg-white p-4'>
      <Calendar onChange={onChange} value={value} />
    </div>
  );
};

export default EventCalendar;
