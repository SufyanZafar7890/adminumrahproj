import type { Metadata } from "next";
import "./globals.css";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";

export const metadata: Metadata = {
  title: "Umrah Taxi Online | Admin & Dispatch Operations",
  description: "Dynamic Management Portal for Rates, WhatsApp Hotlines, Bookings, Fleet, and Policies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen font-sans">
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </body>
    </html>
  );
}
