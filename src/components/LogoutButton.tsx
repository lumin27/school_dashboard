"use client";

import { useClerk } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";

const LogoutButton = () => {
  const { signOut } = useClerk();
  return (
    <button
      onClick={() => signOut({ redirectUrl: "/" })}
      className='flex items-center justify-start gap-4 text-gray-500 py-2 px-2 rounded-md hover:bg-[#edf9fd] w-full'>
      <Image src='/logout.png' alt='logout' width={20} height={20} />
      <span className='text-sm'>Logout</span>
    </button>
  );
};

export default LogoutButton;
