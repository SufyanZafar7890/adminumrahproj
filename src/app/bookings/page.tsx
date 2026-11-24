'use client';

import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Plane,
  Eye,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Car,
  User,
  Phone,
  RotateCcw,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { Booking, BookingStatus, Vehicle, Route } from "@/types";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for creating / editing
  const [formData, setFormData] = useState<Partial<Booking>>({
    customer_name: "",
    customer_phone: "",
    route_title: "",
    route_id: "",
    vehicle_name: "",
    travel_date: new Date().toISOString().split("T")[0],
    pickup_time: "10:00",
    flight_number: "",
    passengers: 2,
    luggage: 2,
    estimated_price_sar: 250,
    status: "pending",
    notes: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, v, r] = await Promise.all([
        dataStore.getBookings(),
        dataStore.getVehicles(),
        dataStore.getRoutes(),
      ]);
      setBookings(b);
      setVehicles(v);
      setRoutes(r);
    } catch (err) {
      console.error("Error loading bookings:", err);
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

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    await dataStore.updateBooking(id, { status: newStatus });
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this booking lead?")) {
      await dataStore.deleteBooking(id);
      await loadData();
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    await dataStore.updateBooking(selectedBooking.id, formData);
    setIsEditing(false);
    setSelectedBooking(null);
    await loadData();
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_phone) return;

    await dataStore.addBooking({
      route_id: formData.route_id || "rt-custom",
      route_title: formData.route_title || "Custom Transfer",
      vehicle_name: formData.vehicle_name || "Toyota Camry",
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      travel_date: formData.travel_date || new Date().toISOString().split("T")[0],
      pickup_time: formData.pickup_time || "",
      flight_number: formData.flight_number || "",
      passengers: Number(formData.passengers) || 1,
      luggage: Number(formData.luggage) || 1,
      estimated_price_sar: Number(formData.estimated_price_sar) || 250,
      status: (formData.status as BookingStatus) || "pending",
      notes: formData.notes || "",
    });

    setIsCreating(false);
    await loadData();
  };

  const openWhatsApp = (phone: string, ref: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Assalam-o-Alaikum ${name}, regarding your Umrah Taxi Booking (${ref}), our chauffeur is ready to confirm your transfer.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const openEditModal = (b: Booking) => {
    setSelectedBooking(b);
    setFormData(b);
    setIsEditing(true);
  };

  const openCreateModal = () => {
    setFormData({
      customer_name: "",
      customer_phone: "+966 ",
      route_title: routes[0]?.title || "Jeddah Airport (KAIA) to Makkah Hotel",
      route_id: routes[0]?.id || "rt-1",
      vehicle_name: vehicles[0]?.name || "Toyota Camry (Sedan)",
      travel_date: new Date().toISOString().split("T")[0],
      pickup_time: "12:00 PM",
      flight_number: "SV-",
      passengers: 2,
      luggage: 2,
      estimated_price_sar: 250,
      status: "pending",
      notes: "",
    });
    setIsCreating(true);
  };

  // Filter & Search Logic
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      b.customer_name.toLowerCase().includes(query) ||
      b.customer_phone.toLowerCase().includes(query) ||
      b.booking_reference.toLowerCase().includes(query) ||
      b.route_title.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

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

  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        title="Bookings & Dispatch Center"
        subtitle="Live management of pilgrim inquiries, chauffeur allocation, and direct WhatsApp communication"
        pendingCount={bookings.filter((b) => b.status === "pending").length}
        onRefresh={loadData}
        onOpenNewBooking={openCreateModal}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Filters and Search Bar */}
        <div className="bg-[#0c1220] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full md:w-auto relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Pilgrim Name, Phone Number, Reference (e.g. UTO-89214)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {["all", "pending", "confirmed", "dispatched", "completed", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {st}
                {st !== "all" && (
                  <span className="ml-1.5 text-[10px] opacity-80">
                    ({bookings.filter((b) => b.status === st).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Bookings */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Pilgrim Name & Contact</th>
                  <th className="py-3 px-4">Transfer Route</th>
                  <th className="py-3 px-4">Fleet Vehicle</th>
                  <th className="py-3 px-4">Travel Date & Flight</th>
                  <th className="py-3 px-4">Fare (SAR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-500">
                      No matching bookings found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Booking Ref */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {b.booking_reference}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(b.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{b.customer_name}</div>
                        <div className="font-mono text-slate-300 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{b.customer_phone}</span>
                        </div>
                        <button
                          onClick={() => openWhatsApp(b.customer_phone, b.booking_reference, b.customer_name)}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp Chauffeur</span>
                        </button>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-200">{b.route_title}</div>
                        {b.notes && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5 italic">
                            "{b.notes}"
                          </div>
                        )}
                      </td>

                      {/* Fleet Vehicle */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-amber-400">{b.vehicle_name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {b.passengers} Passengers • {b.luggage} Bags
                        </div>
                      </td>

                      {/* Travel Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{b.travel_date}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          {b.flight_number && (
                            <>
                              <Plane className="w-3 h-3 text-amber-400" />
                              <span className="font-mono text-amber-400 font-bold">{b.flight_number}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{b.pickup_time || "Time TBD"}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-400 text-sm">{b.estimated_price_sar} SAR</div>
                        <div className="text-[10px] text-slate-500">Pay Chauffeur Cash/Card</div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
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
                            onClick={() => openWhatsApp(b.customer_phone, b.booking_reference, b.customer_name)}
                            className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/20 transition-all"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                            title="Edit Booking Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal: Edit Booking */}
      {isEditing && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedBooking.booking_reference}</span>
                <h3 className="text-sm font-bold text-white">Edit Pilgrim Booking Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Pilgrim Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Tariq Mahmood"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Lead passenger pilgrim name</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Customer Phone (with Country Code)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 966501234567 or 923160424995"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Passenger mobile with country code for WhatsApp</p>
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Route</label>
                <input
                  type="text"
                  placeholder="e.g. Jeddah Airport (KAIA) to Makkah Hotel"
                  value={formData.route_title}
                  onChange={(e) => setFormData({ ...formData, route_title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Designated pickup and dropoff corridor</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Vehicle</label>
                <input
                  type="text"
                  placeholder="e.g. GMC Yukon XL 2025"
                  value={formData.vehicle_name}
                  onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Assigned chauffeur fleet vehicle</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Fare (SAR)</label>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={formData.estimated_price_sar}
                  onChange={(e) => setFormData({ ...formData, estimated_price_sar: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-emerald-400"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Agreed fare in SAR, payable on arrival</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Travel Date</label>
                <input
                  type="date"
                  value={formData.travel_date}
                  onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Scheduled date of transfer</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Flight Number</label>
                <input
                  type="text"
                  placeholder="e.g. SV-104 or PK-741"
                  value={formData.flight_number}
                  onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Flight code for live radar delay tracking</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Passengers (Pax)</label>
                <input
                  type="number"
                  placeholder="e.g. 4"
                  value={formData.passengers}
                  onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Total count of passengers</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Luggage Bags</label>
                <input
                  type="number"
                  placeholder="e.g. 4"
                  value={formData.luggage}
                  onChange={(e) => setFormData({ ...formData, luggage: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Total check-in suitcases</p>
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Operational dispatch progression stage</p>
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Pilgrim Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Free Miqat stop requested at Masjid Aisha..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Special passenger instructions or hotel address</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create New Booking Lead */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateNew} className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Create New Pilgrim Booking Lead</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Pilgrim Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Tariq Mahmood"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Lead pilgrim name</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Customer Phone (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 966501234567 or 923160424995"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Country code + phone without + or spaces</p>
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Transfer Route *</label>
                <select
                  value={formData.route_title}
                  onChange={(e) => {
                    const r = routes.find((item) => item.title === e.target.value);
                    setFormData({
                      ...formData,
                      route_title: e.target.value,
                      route_id: r?.id || "",
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.title}>
                      {r.title} ({r.distance_km} km)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Designated holy corridor</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Fleet Vehicle *</label>
                <select
                  value={formData.vehicle_name}
                  onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name} ({v.max_passengers} Pax)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Assigned fleet vehicle model</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Estimated Fare (SAR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 250"
                  value={formData.estimated_price_sar}
                  onChange={(e) => setFormData({ ...formData, estimated_price_sar: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-emerald-400"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Total fixed price in SAR</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Travel Date *</label>
                <input
                  type="date"
                  required
                  value={formData.travel_date}
                  onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Scheduled journey date</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Pickup Time</label>
                <input
                  type="text"
                  placeholder="e.g. 14:30 or As per flight landing"
                  value={formData.pickup_time}
                  onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Chauffeur arrival time</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Flight Number (Airport Pickup)</label>
                <input
                  type="text"
                  placeholder="e.g. SV-104 or PK-741"
                  value={formData.flight_number}
                  onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: For automated flight radar delay tracking</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Pax</label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Passengers</p>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Bags</label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.luggage}
                    onChange={(e) => setFormData({ ...formData, luggage: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Suitcases</p>
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Special Notes / Miqat Stop / Hotel</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Free Miqat stop requested at Masjid Aisha..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Passenger requests or hotel dropoff details</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                Create Booking
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
