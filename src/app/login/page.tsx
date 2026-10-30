"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle, Loader2, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("jki_erp_remember_id");
    if (saved) setIdentifier(saved);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      if (rememberMe) {
        localStorage.setItem("jki_erp_remember_id", identifier.trim());
      } else {
        localStorage.removeItem("jki_erp_remember_id");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-[#1a2c4e] to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#253c68] to-[#3a568c] items-center justify-center shadow-lg shadow-[#253c68]/30 mb-4 border border-slate-700">
            <span className="text-white font-black text-2xl tracking-wider">JKI</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">JKIOCEAN HUB</h1>
          <p className="text-xs uppercase tracking-widest text-[#253c68] font-bold mt-1">Let Beauty Begin</p>
          <p className="text-xs text-slate-500 mt-2">Hệ thống quản lý khách hàng B2B, bán hàng & kho hàng</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email hoặc Mã nhân viên
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="VD: johnny, hanna, hoặc johnny@jkiocean.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#253c68] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#253c68] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#253c68] rounded border-slate-300 focus:ring-[#253c68]"
              />
              <span className="text-xs text-slate-600">Ghi nhớ đăng nhập</span>
            </label>
            <span className="text-xs text-slate-400">Dùng chung SSO Nextcloud</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#253c68] hover:bg-[#1a2c4e] text-white rounded-xl text-sm font-bold shadow-md shadow-[#253c68]/20 flex items-center justify-center space-x-2 transition-all btn-press disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kết nối SSO...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Hệ Thống</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bảo mật nội bộ • Cổng xác thực tập trung JKIOCEAN</span>
        </div>
      </div>
    </div>
  );
}
