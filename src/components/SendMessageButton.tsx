"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Loader from "./Loader";

const MessageForm = dynamic(() => import("./forms/MessageForm"), {
  loading: () => <Loader />,
});

interface SendMessageButtonProps {
  userRole: string;
  userId: string;
}

export default function SendMessageButton({
  userRole,
  userId,
}: SendMessageButtonProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <button
        className='px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mb-4 flex items-center gap-2 cursor-pointer mt-2 lg:mr-2'
        onClick={() => setShowForm(true)}>
        <Image
          src='/create.png'
          alt='create'
          width={16}
          height={16}
          className=' bg-white rounded-full px-1 py-1'
        />
        Send Message
      </button>

      <MessageForm
        userRole={userRole}
        userId={userId}
        open={showForm}
        setOpen={setShowForm}
      />
    </div>
  );
}
