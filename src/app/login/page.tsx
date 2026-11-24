'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Database,
  ArrowRight,
} from "lucide-react";
import { dataStore } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const session = dataStore.getAdminSession();
    if (session) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await dataStore.loginAdmin(username, password);
      if (res.success) {
        router.push("/");
      } else {
        setErrorMessage(res.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Login failed. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const isLive = dataStore.isLiveMode();

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-orange-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 items-center justify-center shadow-xl shadow-amber-500/20 text-black text-2xl font-black mb-1">
            🕋
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            UMRAH TAXI <span className="text-amber-400">ADMIN</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Pilgrim Chauffeur Dispatch & Fleet Operations Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5">
          {/* Supabase status badge */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400">Authentication Gateway</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                isLive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}
            >
              <Database className="w-3 h-3" />
              <span>{isLive ? "Supabase Live DB" : "Default Sandbox Access"}</span>
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4 text-xs">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Admin Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Enter your administrator username registered in Supabase.
              </p>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Enter your confidential admin password (strictly verified against database).
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials with Supabase...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Database Verification Note */}
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strict Database Authentication</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Login credentials are verified live against your Supabase database table{" "}
              <code className="text-amber-400 font-mono bg-slate-950 px-1 py-0.5 rounded">admin_users</code>. No hardcoded credentials are used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
