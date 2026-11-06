"use client";

import { usePathname } from "next/navigation";
import Sidebar, { MobileNav } from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The login screen renders full-bleed without app chrome
  if (pathname?.startsWith("/login")) return <>{children}</>;

  return (
    <div className="flex min-h-screen app-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pt-6 pb-28 lg:pb-12">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
