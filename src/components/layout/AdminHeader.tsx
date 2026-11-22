'use client';

import React from "react";
import { Bell, Plus, Search, Database, Globe, RefreshCw } from "lucide-react";
import { dataStore } from "@/lib/storage";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  pendingCount?: number;
  onRefresh?: () => void;
  onOpenNewBooking?: () => void;
}

export function AdminHeader({
  title,
  subtitle,
  pendingCount = 0,
  onRefresh,
  onOpenNewBooking,
}: AdminHeaderProps) {
  const isLive = dataStore.isLiveMode();

  return (
    <header className="h-18 px-6 bg-[#0c1220]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
          {title}
          {pendingCount > 0 && (
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse">
              {pendingCount} Pending Leads
            </span>
          )}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Supabase status badge */}
        <div
          title={isLive ? "Connected to Supabase PostgreSQL" : "Local Storage Mode (Offline / Sandbox Demo)"}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
            isLive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
          }`}
        >
          {isLive ? <Database className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          <span>{isLive ? "Supabase Live" : "Demo Storage Mode"}</span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Quick New Booking Button */}
        {onOpenNewBooking && (
          <button
            onClick={onOpenNewBooking}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Booking Lead</span>
          </button>
        )}
      </div>
    </header>
  );
}
