"use client";

import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const protectedPages = ["/profile", "/projects"];

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const isProtected = protectedPages.some(p => pathname?.startsWith(p));
    
    if (!userId && isProtected) {
      router.push("/login");
    } else {
      setIsAuth(true);
    }
  }, [pathname, router, isAuthPage]);

  // Don't render until auth check completes to prevent flashing
  if (isAuth === null && !isAuthPage) return null;

  if (isAuthPage) {
    return <div className="min-h-screen flex items-center justify-center bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 md:px-12 relative z-10 transition-colors">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
