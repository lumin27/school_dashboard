"use client";

import { useState } from "react";
import Image from "next/image";
import AttendanceForm from "./forms/AttendanceForm";

interface AttendanceFormButtonProps {
  userRole: string;
  userId: string;
}

export default function AttendanceFormButton({
  userRole,
  userId,
}: AttendanceFormButtonProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <button className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
        <Image
          onClick={() => setShowForm(!showForm)}
          src='/create.png'
          alt='create'
          width={16}
          height={16}
          className='cursor-pointer'
        />
      </button>
      {showForm && <AttendanceForm userRole={userRole} userId={userId} />}
    </div>
  );
}
