"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || redirected) return;

    const role = user?.publicMetadata?.role;

    if (typeof role === "string" && role.length > 0) {
      setRedirected(true);
      router.replace(`/${role}`);
    } else {
      setRedirected(true);
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, user, redirected, router]);

  return <p className='text-center p-10'>Redirecting...</p>;
}
