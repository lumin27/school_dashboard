"use client";

import Image from "next/image";
export default function AttendanceDetailsButton() {
  return (
    <Image
      onClick={() => {
        window.location.href = "/list/attendance";
      }}
      src='/moreDark.png'
      alt='...'
      width={20}
      height={20}
      className='cursor-pointer'
    />
  );
}
