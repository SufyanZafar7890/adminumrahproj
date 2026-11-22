'use client';

import React from "react";
import { Bell, Plus, Search, Database, Globe, RefreshCw, Menu } from "lucide-react";
import { dataStore } from "@/lib/storage";
import { useSidebar } from "@/context/SidebarContext";

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
  const { toggleDrawer } = useSidebar();

  return (
    <header className="h-16 sm:h-18 px-4 sm:px-6 bg-[#0c1220]/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Drawer button for mobile devices */}
        <button
          type="button"
          onClick={toggleDrawer}
          aria-label="Open Navigation Drawer"
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5 text-amber-400" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 truncate">
            <span className="truncate">{title}</span>
            {pendingCount > 0 && (
              <span className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse shrink-0">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Supabase status badge */}
        <div
          title={isLive ? "Connected to Supabase PostgreSQL" : "Local Storage Mode (Offline / Sandbox Demo)"}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 border ${
            isLive
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
          }`}
        >
          {isLive ? <Database className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isLive ? "Supabase Live" : "Demo Storage Mode"}</span>
          <span className="sm:hidden">{isLive ? "Live" : "Demo"}</span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Quick New Booking Button */}
        {onOpenNewBooking && (
          <button
            onClick={onOpenNewBooking}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Lead</span>
          </button>
        )}
      </div>
    </header>
  );
}
