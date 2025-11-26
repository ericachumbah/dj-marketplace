"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract locale from pathname
  const locale = pathname.split("/")[1] || "en";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/signin`);
    } else if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      
      if (userRole === "ADMIN") {
        router.push(`/${locale}/admin`);
      } else if (userRole === "DJ") {
        router.push(`/${locale}/dj/dashboard`);
      } else {
        router.push(`/${locale}`);
      }
    }
  }, [session, status, router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
