// app/account/page.tsx
"use client";

import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className='p-4'>
      <h1 className='text-lg font-semibold mb-4'>Account Settings</h1>
      <UserProfile />
    </div>
  );
}
