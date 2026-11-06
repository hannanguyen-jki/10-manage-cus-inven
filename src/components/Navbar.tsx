"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui";

type User = { fullName: string; role: string; department?: string; email: string };

const DEFAULT_USER: User = { fullName: "Johnny Tran", role: "ADMIN", department: "BOD", email: "johnny@jkiocean.com" };

const cleanName = (name?: string) =>
  (name || "").replace(/\s*\([Ss][ếe]p\)/gi, "").replace(/\s*[Ss]ếp/gi, "").trim();

function greeting(hour: number) {
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 14) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) setUser({ ...data.user, fullName: cleanName(data.user.fullName) });
        else setUser(DEFAULT_USER);
      })
      .catch(() => setUser(DEFAULT_USER));

    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const fmt = (tz: string) =>
    now ? now.toLocaleTimeString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--";
  const houstonHour = now ? Number(now.toLocaleString("en-US", { timeZone: "America/Chicago", hour: "numeric", hour12: false })) : 9;
  const firstName = (user?.fullName || "").split(" ")[0];

  return (
    <header className="shrink-0 px-4 sm:px-6 lg:px-10 pt-4 lg:pt-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Mobile logo */}
        <Link href="/dashboard" className="lg:hidden">
          <Image src="/logo-full.png" alt="JKI OCEAN" width={2373} height={1125} className="h-9 w-auto" priority />
        </Link>

        {/* Greeting (desktop) */}
        <div className="hidden lg:block">
          <p className="text-sm text-ink-400">{greeting(houstonHour)} 👋</p>
          <p className="text-lg font-bold text-ink-900">{firstName || "bạn"}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Clocks */}
          <div className="hidden sm:flex items-center gap-1 rounded-2xl bg-white/80 backdrop-blur border border-ink-100 p-1 shadow-sm">
            <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5" title="Giờ Houston (Mỹ)">
              <span className="text-[11px] font-semibold text-ink-400">Houston</span>
              <span className="text-sm font-semibold tabular-nums text-ink-800">{fmt("America/Chicago")}</span>
            </div>
            <div className="w-px h-5 bg-ink-100" />
            <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5" title="Giờ Việt Nam">
              <span className="text-[11px] font-semibold text-ink-400">Việt Nam</span>
              <span className="text-sm font-semibold tabular-nums text-ink-800">{fmt("Asia/Ho_Chi_Minh")}</span>
            </div>
          </div>

          {/* User */}
          {user && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/80 backdrop-blur border border-ink-100 py-1 pl-1 pr-1 sm:pr-2 shadow-sm">
              <Avatar name={user.fullName} size="sm" />
              <div className="hidden md:block leading-tight pr-1">
                <p className="text-sm font-semibold text-ink-800">{user.fullName}</p>
                <p className="text-[11px] text-ink-400">{user.department || user.role}</p>
              </div>
              <button onClick={handleLogout} title="Đăng xuất" aria-label="Đăng xuất" className="icon-btn hover:!text-rose-600 hover:!bg-rose-50">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
