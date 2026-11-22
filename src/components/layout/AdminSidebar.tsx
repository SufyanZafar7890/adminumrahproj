'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  MapPin,
  CircleDollarSign,
  Users2,
  Star,
  HelpCircle,
  Settings,
  PhoneCall,
  ShieldCheck,
  RotateCcw,
  X,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { useSidebar } from "@/context/SidebarContext";

interface AdminSidebarProps {
  pendingCount?: number;
}

export function AdminSidebar({ pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isDrawerOpen, closeDrawer } = useSidebar();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "Bookings & Dispatch",
      href: "/bookings",
      icon: CalendarCheck,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeClass: "bg-amber-500 text-black font-bold",
    },
    {
      name: "Fleet & Vehicles",
      href: "/vehicles",
      icon: Car,
      badge: null,
    },
    {
      name: "Routes & Pricing",
      href: "/routes",
      icon: MapPin,
      badge: null,
    },
    {
      name: "Pricing Matrix",
      href: "/pricing",
      icon: CircleDollarSign,
      badge: null,
    },
    {
      name: "Chauffeurs / Drivers",
      href: "/drivers",
      icon: Users2,
      badge: null,
    },
    {
      name: "Testimonials",
      href: "/testimonials",
      icon: Star,
      badge: null,
    },
    {
      name: "FAQs & Guides",
      href: "/faqs",
      icon: HelpCircle,
      badge: null,
    },
    {
      name: "Site Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  const handleResetData = () => {
    if (confirm("Reset local demo data to initial factory state?")) {
      dataStore.resetToDefaultSeed();
    }
  };

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand / Logo Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black font-black text-xl shrink-0">
              🕋
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                UMRAH TAXI
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ADMIN
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Dispatch Operations</p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {isMobile && (
            <button
              onClick={closeDrawer}
              aria-label="Close Navigation Drawer"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5 text-amber-400" />
            </button>
          )}
        </div>

        {/* Realtime Status Indicator */}
        <div className="mx-3 sm:mx-4 my-3 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-300">Dispatch Radar Active</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            LIVE
          </span>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (isMobile) closeDrawer();
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                      item.badgeClass || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Operations quick info */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">Direct WhatsApp Dispatch</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">+966 59 120 6299</p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>TGA Compliant</span>
          </div>
          <button
            onClick={handleResetData}
            title="Reset demo data to default initial state"
            className="flex items-center gap-1 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Permanent Sidebar (lg and up) */}
      <aside className="w-64 bg-[#0c1220] border-r border-slate-800 shrink-0 h-screen sticky top-0 overflow-y-auto hidden lg:flex flex-col justify-between">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Drawer & Backdrop (below lg) */}
      {isDrawerOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0c1220] border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        {renderSidebarContent(true)}
      </div>
    </>
  );
}
