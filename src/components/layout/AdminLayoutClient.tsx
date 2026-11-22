'use client';

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { ProgressBar } from "./ProgressBar";
import { dataStore } from "@/lib/storage";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const loadPending = async () => {
    try {
      const metrics = await dataStore.getMetrics();
      setPendingCount(metrics.pendingCount);
    } catch (err) {
      console.error("Error loading pending metrics:", err);
    }
  };

  useEffect(() => {
    // If not on login page, check if logged in
    if (pathname !== "/login") {
      const session = dataStore.getAdminSession();
      if (!session) {
        router.push("/login");
        return;
      }
    }
    setIsCheckingAuth(false);
  }, [pathname, router]);

  useEffect(() => {
    loadPending();
    const handleStorageUpdate = () => loadPending();
    window.addEventListener("storage_updated", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    const interval = setInterval(loadPending, 15000);
    return () => {
      window.removeEventListener("storage_updated", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
      clearInterval(interval);
    };
  }, []);

  // For /login route, render only the login page without the sidebar
  if (pathname === "/login") {
    return (
      <>
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <main className="w-full min-h-screen">{children}</main>
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
      <Suspense fallback={null}>
        <ProgressBar />
      </Suspense>
      <AdminSidebar pendingCount={pendingCount} />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
  );
}
