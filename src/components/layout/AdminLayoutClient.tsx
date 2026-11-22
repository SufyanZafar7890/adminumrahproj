'use client';

import React, { useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { dataStore } from "@/lib/storage";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState<number>(0);

  const loadPending = async () => {
    try {
      const metrics = await dataStore.getMetrics();
      setPendingCount(metrics.pendingCount);
    } catch (err) {
      console.error("Error loading pending metrics:", err);
    }
  };

  useEffect(() => {
    loadPending();
    const handleStorageUpdate = () => loadPending();
    window.addEventListener("storage_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    // Polling every 15s to check for updates
    const interval = setInterval(loadPending, 15000);
    return () => {
      window.removeEventListener("storage_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
      <AdminSidebar pendingCount={pendingCount} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
