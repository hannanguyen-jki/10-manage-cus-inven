"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle, Loader2, User, Lock, Users, Wallet, FileText } from "lucide-react";
import { Aurora } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jki_erp_remember_id");
      if (saved) setIdentifier(saved);
    } catch {
      /* storage unavailable */
    }
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
      if (!res.ok) throw new Error(data.error || "Sign-in failed");
      try {
        if (rememberMe) localStorage.setItem("jki_erp_remember_id", identifier.trim());
        else localStorage.removeItem("jki_erp_remember_id");
      } catch {
        /* storage unavailable */
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink-950 p-12 text-white">
        <Aurora />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative">
          <div className="inline-flex rounded-3xl bg-white p-4 shadow-2xl">
            <Image src="/logo-full.png" alt="JKI OCEAN" width={2373} height={1125} className="h-14 w-auto" priority />
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Customer management, <span className="gradient-text">simple</span> and clear.
          </h2>
          <div className="mt-8 space-y-4">
            {[
              { icon: Users, text: "All customers and contact details" },
              { icon: Wallet, text: "See at a glance who has paid" },
              { icon: FileText, text: "PDF quotes with product photos" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={text} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${200 + i * 120}ms` }}>
                <span className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-300" />
                </span>
                <span className="text-ink-200">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-ink-400">© JKIOCEAN · Let Beauty Begin</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 app-bg">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden mb-8 flex justify-center">
            <Image src="/logo-full.png" alt="JKI OCEAN" width={2373} height={1125} className="h-14 w-auto" priority />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">Sign in</h1>
          <p className="mt-1 text-sm text-ink-500">Use your JKI attendance account.</p>

          {error && (
            <div className="mt-6 flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 animate-pop-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email or employee ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. johnny"
                  className="input pl-11 py-3"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-11 py-3"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-brand-500" />
              <span className="text-sm text-ink-600">Remember me</span>
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
