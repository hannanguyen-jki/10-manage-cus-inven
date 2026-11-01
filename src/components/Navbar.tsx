"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Clock } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; role: string; department?: string; email: string } | null>(null);
  const [houstonTime, setHoustonTime] = useState("");
  const [vnTime, setVnTime] = useState("");

  const sanitizeFullName = (name?: string) => {
    if (!name) return "";
    return name
      .replace(/\s*\([Ss][ếe]p\)/gi, "")
      .replace(/\s*[Ss]ếp/gi, "")
      .trim();
  };

  useEffect(() => {
    // Fetch current user from /api/auth/me
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser({
            ...data.user,
            fullName: sanitizeFullName(data.user.fullName),
          });
        } else {
          // Default placeholder for demo
          setUser({ fullName: "Johnny Tran", role: "ADMIN", department: "BOD", email: "johnny@jkiocean.com" });
        }
      })
      .catch(() => {
        setUser({ fullName: "Johnny Tran", role: "ADMIN", department: "BOD", email: "johnny@jkiocean.com" });
      });

    // Update dual clocks (Houston CST & Vietnam GMT+7)
    const updateClocks = () => {
      const now = new Date();
      setHoustonTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "America/Chicago",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setVnTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const displayName = sanitizeFullName(user?.fullName || "");

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
      {/* Dual Timezone Status */}
      <div className="flex items-center space-x-6 text-xs text-slate-500">
        <div className="flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Clock className="w-3.5 h-3.5 text-[#253c68]" />
          <span className="font-semibold text-slate-700">Houston (CST):</span>
          <span className="font-mono text-slate-900 font-bold">{houstonTime || "--:--"}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-700">VN Hub (GMT+7):</span>
          <span className="font-mono text-slate-900 font-bold">{vnTime || "--:--"}</span>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 border-r border-slate-200 pr-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#253c68] to-[#3a568c] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {displayName.charAt(0) || "U"}
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{displayName}</p>
              <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                <span className="text-[10px] bg-[#253c68]/10 text-[#253c68] font-semibold px-1.5 py-0.2 rounded">
                  {user.role}
                </span>
                {user.department && (
                  <span className="text-[10px] text-slate-400 font-medium">({user.department})</span>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
