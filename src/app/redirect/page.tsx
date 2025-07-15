"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const role = useMemo(() => {
    if (!isLoaded || !isSignedIn) return null;
    const r = user?.publicMetadata?.role;
    return typeof r === "string" && r.length > 0 ? r : null;
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!role) return;

    console.log("✅ Redirecting to role:", role);
    router.replace(role ? `/${role}` : "/");
  }, [role, router]);

  return <p className='text-center p-10'>Redirecting...</p>;
}
