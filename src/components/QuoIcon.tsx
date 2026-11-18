import React from "react";

/** Small Quo (OpenPhone) badge used on the "message via Quo" buttons. */
export default function QuoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#FFE500" />
      <text x="12" y="17" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif" fill="#111111">
        Q
      </text>
    </svg>
  );
}
