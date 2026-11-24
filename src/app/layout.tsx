import type { Metadata } from "next";
import "./globals.css";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://admin.makkahmadinahziyarat.com"),
  title: "Admin Portal | Makkah Madinah Ziyarat & Umrah Dispatch",
  description: "Dynamic Management Portal for Rates, WhatsApp Hotlines, Bookings, Fleet, and Policies",
  robots: {
    index: false,
    follow: false,
  },
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
