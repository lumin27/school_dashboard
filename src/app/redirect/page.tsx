"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const role = user?.publicMetadata.role;

    if (role) {
      router.replace(`/${role}`);
    } else {
      router.replace("/");
    }
  }, [user, isLoaded, router]);

  return <p className='text-center p-10'>Redirecting...</p>;
}
