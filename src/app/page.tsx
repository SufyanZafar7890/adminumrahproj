'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Car,
  MapPin,
  Settings,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  DollarSign,
  User,
  Phone,
  Plane,
  Eye,
  RefreshCw,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { Booking, DashboardMetrics, Vehicle, Route } from "@/types";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBookings: 0,
    pendingCount: 0,
    confirmedCount: 0,
    dispatchedCount: 0,
    completedCount: 0,
    totalRevenueSar: 0,
    todayCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, b, v, r] = await Promise.all([
        dataStore.getMetrics(),
        dataStore.getBookings(),
        dataStore.getVehicles(),
        dataStore.getRoutes(),
      ]);
      setMetrics(m);
      setRecentBookings(b.slice(0, 7));
      setVehicles(v);
      setRoutes(r);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("storage_updated", handleUpdate);
    return () => window.removeEventListener("storage_updated", handleUpdate);
  }, []);

  const handleStatusChange = async (id: string, newStatus: any) => {
    await dataStore.updateBooking(id, { status: newStatus });
    await loadData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "confirmed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "dispatched":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const openWhatsApp = (phone: string, ref: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Assalam-o-Alaikum ${name}, regarding your Umrah Taxi Booking (${ref}), our chauffeur is ready to confirm your transfer.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        title="Operations Dashboard"
        subtitle="Live overview of pilgrim bookings, fleet availability, and dispatch status"
        pendingCount={metrics.pendingCount}
        onRefresh={loadData}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Bookings */}
          <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bookings</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white tracking-tight">{metrics.totalBookings}</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                +{metrics.todayCount} Today
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">All time customer inquiries</p>
          </div>

          {/* Card 2: Pending Inquiries */}
          <div className="p-5 rounded-2xl bg-[#0c1220] border border-amber-500/30 hover:border-amber-500/50 transition-all shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending Action</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5 animate-spin-slow" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-400 tracking-tight">{metrics.pendingCount}</span>
              <Link
                href="/bookings?status=pending"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Dispatch Now &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-2">Requires WhatsApp / driver allocation</p>
          </div>

          {/* Card 3: Active Operations */}
          <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {metrics.confirmedCount + metrics.dispatchedCount}
              </span>
              <span className="text-xs text-slate-400">
                {metrics.completedCount} Completed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Confirmed & Chauffeurs Dispatched</p>
          </div>

          {/* Card 4: Estimated Pipeline Revenue */}
          <div className="p-5 rounded-2xl bg-[#0c1220] border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline SAR</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                {metrics.totalRevenueSar.toLocaleString()} <span className="text-base font-bold text-slate-400">SAR</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Calculated from dynamic route rates</p>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0e172a] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Live Dynamic Configuration</h2>
              <p className="text-xs text-slate-400">
                Fleet: <span className="text-amber-400 font-bold">{vehicles.length} Vehicles</span> • Routes:{" "}
                <span className="text-amber-400 font-bold">{routes.length} Active Routes</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Pricing Matrix</span>
            </Link>
            <Link
              href="/settings"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Hotline & Addresses</span>
            </Link>
            <a
              href="https://umrah-taxi-web.pages.dev"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Preview Live Site</span>
            </a>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Recent Booking Inquiries & Leads</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                  {recentBookings.length} shown
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Click WhatsApp to send instant confirmation or update status</p>
            </div>
            <Link
              href="/bookings"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View All Bookings &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Ref & Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Route & Vehicle</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No booking records found.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Ref & Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-amber-400 font-bold text-xs">{b.booking_reference}</div>
                        <div className="font-semibold text-white mt-0.5">{b.customer_name}</div>
                        {b.flight_number && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Plane className="w-3 h-3 text-slate-500" />
                            <span>Flight: {b.flight_number}</span>
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-300">{b.customer_phone}</div>
                        <button
                          onClick={() => openWhatsApp(b.customer_phone, b.booking_reference, b.customer_name)}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp Chauffeur</span>
                        </button>
                      </td>

                      {/* Route & Vehicle */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-200 font-medium truncate">{b.route_title}</div>
                        <div className="text-[11px] text-amber-400/90 font-medium mt-0.5 flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          <span>{b.vehicle_name}</span>
                          <span className="text-slate-500">• {b.passengers} Pax / {b.luggage} Bags</span>
                        </div>
                      </td>

                      {/* Travel Date */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-semibold">{b.travel_date}</div>
                        <div className="text-[11px] text-slate-400">{b.pickup_time || "As per flight"}</div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        {b.estimated_price_sar} SAR
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border cursor-pointer outline-none transition-all ${getStatusBadge(
                            b.status
                          )} bg-slate-900`}
                        >
                          <option value="pending" className="bg-slate-900 text-amber-400">Pending</option>
                          <option value="confirmed" className="bg-slate-900 text-blue-400">Confirmed</option>
                          <option value="dispatched" className="bg-slate-900 text-purple-400">Dispatched</option>
                          <option value="completed" className="bg-slate-900 text-emerald-400">Completed</option>
                          <option value="cancelled" className="bg-slate-900 text-rose-400">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                            title="View Full Booking Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openWhatsApp(b.customer_phone, b.booking_reference, b.customer_name)}
                            className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/20 transition-all"
                            title="Open in WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selectedBooking.booking_reference}
                </span>
                <h3 className="text-base font-bold text-white mt-1">Booking Detail Record</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Customer Name:</span>
                <span className="font-bold text-white text-sm">{selectedBooking.customer_name}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Phone Number:</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">{selectedBooking.customer_phone}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 col-span-2">
                <span className="text-slate-400 block">Transfer Route:</span>
                <span className="font-bold text-slate-200">{selectedBooking.route_title}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Selected Fleet:</span>
                <span className="font-bold text-amber-400">{selectedBooking.vehicle_name}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Estimated Rate:</span>
                <span className="font-bold text-emerald-400 text-base">{selectedBooking.estimated_price_sar} SAR</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Travel Date:</span>
                <span className="font-bold text-slate-200">{selectedBooking.travel_date}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Flight / Pickup:</span>
                <span className="font-bold text-slate-200">
                  {selectedBooking.flight_number || "No Flight"} ({selectedBooking.pickup_time || "Scheduled"})
                </span>
              </div>
              {selectedBooking.notes && (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 col-span-2">
                  <span className="text-slate-400 block">Special Pilgrim Notes:</span>
                  <p className="text-slate-300 mt-1 italic">"{selectedBooking.notes}"</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => openWhatsApp(selectedBooking.customer_phone, selectedBooking.booking_reference, selectedBooking.customer_name)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Pilgrim on WhatsApp</span>
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
