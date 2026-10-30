"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "navy" | "emerald" | "amber" | "rose" | "sky";
  badge?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "navy",
  badge,
}: MetricCardProps) {
  const colorMap = {
    navy: {
      border: "hover:border-[#253c68]/40",
      iconBg: "bg-[#253c68]/10 text-[#253c68]",
      glow: "group-hover:shadow-[0_8px_30px_rgb(37,60,104,0.12)]",
      badge: "bg-[#253c68]/10 text-[#253c68]",
    },
    emerald: {
      border: "hover:border-emerald-500/40",
      iconBg: "bg-emerald-50 text-emerald-600",
      glow: "group-hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)]",
      badge: "bg-emerald-50 text-emerald-700",
    },
    amber: {
      border: "hover:border-amber-500/40",
      iconBg: "bg-amber-50 text-amber-600",
      glow: "group-hover:shadow-[0_8px_30px_rgb(245,158,11,0.12)]",
      badge: "bg-amber-50 text-amber-700",
    },
    rose: {
      border: "hover:border-rose-500/40",
      iconBg: "bg-rose-50 text-rose-600",
      glow: "group-hover:shadow-[0_8px_30px_rgb(244,63,94,0.12)]",
      badge: "bg-rose-50 text-rose-700",
    },
    sky: {
      border: "hover:border-sky-500/40",
      iconBg: "bg-sky-50 text-sky-600",
      glow: "group-hover:shadow-[0_8px_30px_rgb(56,189,248,0.12)]",
      badge: "bg-sky-50 text-sky-700",
    },
  };

  const selected = colorMap[color];

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm transition-all duration-300 card-hover ${selected.border} ${selected.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selected.badge}`}>
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${selected.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
        {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
        {trend && (
          <span
            className={`font-bold inline-flex items-center space-x-0.5 ${
              trend.isPositive ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{trend.value}</span>
          </span>
        )}
      </div>
    </div>
  );
}
