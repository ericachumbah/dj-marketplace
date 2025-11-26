"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      
      if (userRole === "ADMIN") {
        router.push("/admin");
      } else if (userRole === "DJ") {
        router.push("/dj/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
