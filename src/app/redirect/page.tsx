"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const role = user?.publicMetadata?.role;

    console.log("🔁 Redirecting to:", role);

    if (typeof role === "string") {
      router.replace(`/${role}`);
    } else {
      router.replace("/");
    }
  }, [user, isLoaded, isSignedIn, router]);

  return <p className='text-center p-10'>Redirecting...</p>;
}
