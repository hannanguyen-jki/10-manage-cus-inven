"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Target,
  Package,
  FileText,
  Receipt,
  TrendingDown,
  PhoneCall,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "B2B Customers", href: "/customers", icon: Users },
  { title: "B2B Leads AI", href: "/leads", icon: Target, badge: "AI", badgeColor: "bg-sky-500 text-white" },
  { title: "Inventory & Products", href: "/inventory", icon: Package },
  { title: "PDF Quotes", href: "/quotes", icon: FileText },
  { title: "Accounts Receivable (AR)", href: "/ar", icon: Receipt },
  { title: "Churn Alerts", href: "/churn", icon: TrendingDown, badge: "Alert", badgeColor: "bg-rose-500 text-white" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-[#1a2c4e]/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3a568c] to-[#253c68] flex items-center justify-center shadow-lg shadow-[#253c68]/20 border border-slate-700">
            <span className="text-white font-black text-lg tracking-wider">JKI</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-white text-base tracking-wide">JKIOCEAN</span>
              <span className="text-[10px] bg-[#38bdf8]/20 text-[#38bdf8] font-bold px-1.5 py-0.5 rounded">HUB</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Houston, TX • ERP</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          OPERATIONS & MANAGEMENT
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-[#253c68] to-[#1e3054] text-white shadow-md shadow-[#253c68]/30 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-[#38bdf8]" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <PhoneCall className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-mono text-[11px]">+1 (713) 330-6165</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
            Quo SMS
          </span>
        </div>
      </div>
    </aside>
  );
}
