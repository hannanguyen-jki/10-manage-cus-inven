"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Wallet, FileText, Plus, Phone } from "lucide-react";
import { cn } from "@/components/ui";

export const navItems = [
  { title: "Tổng quan", short: "Tổng quan", href: "/dashboard", icon: LayoutGrid },
  { title: "Khách hàng", short: "Khách", href: "/customers", icon: Users },
  { title: "Thanh toán", short: "Thanh toán", href: "/payments", icon: Wallet },
  { title: "Báo giá", short: "Báo giá", href: "/quotes", icon: FileText },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col h-screen sticky top-0 p-4">
      <div className="flex flex-col h-full rounded-[28px] bg-white/80 backdrop-blur-xl border border-ink-100 shadow-soft overflow-hidden">
        {/* Logo */}
        <Link href="/dashboard" className="px-6 pt-7 pb-6 block group">
          <Image
            src="/logo-full.png"
            alt="JKI OCEAN"
            width={2373}
            height={1125}
            priority
            className="h-12 w-auto transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <p className="mt-3 text-xs font-medium text-ink-400">Quản lý khách hàng</p>
        </Link>

        {/* Quick action */}
        <div className="px-4">
          <Link href="/quotes/create" className="btn-primary w-full py-3">
            <Plus className="w-4 h-4" />
            Tạo báo giá mới
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 group",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:text-ink-900 hover:bg-ink-50"
                )}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-brand-500" />}
                <span
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                    active
                      ? "bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow"
                      : "bg-ink-50 text-ink-500 group-hover:bg-white group-hover:text-brand-600 group-hover:shadow-soft group-hover:scale-110"
                  )}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Hotline */}
        <div className="m-4 rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 p-4 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-brand-500/40 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-brand-300" />
            </div>
            <div>
              <p className="text-[11px] text-ink-300">Hotline Houston</p>
              <a href="tel:+17133306165" className="text-sm font-semibold tracking-wide hover:text-brand-300">
                +1 (713) 330-6165
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Bottom tab bar for phones / tablets */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-3 inset-x-3 z-50">
      <div className="mx-auto max-w-md flex items-center justify-around rounded-3xl bg-white/90 backdrop-blur-xl border border-ink-100 shadow-lift px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[11px] font-semibold transition-all",
                active ? "text-brand-600" : "text-ink-400"
              )}
            >
              <span className={cn("w-10 h-8 rounded-xl flex items-center justify-center transition-all", active && "bg-brand-50")}>
                <Icon className="w-5 h-5" />
              </span>
              {item.short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
