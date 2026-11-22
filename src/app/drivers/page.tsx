'use client';

import React, { useEffect, useState } from "react";
import {
  Users2,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Car,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { Driver } from "@/types";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Driver>>({
    full_name: "",
    phone_number: "+966 5",
    vehicle_plate: "",
    vehicle_model: "Toyota Camry 2025",
    license_number: "",
    status: "available",
    is_active: true,
  });

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await dataStore.getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error("Error loading drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData({
      full_name: "",
      phone_number: "+966 5",
      vehicle_plate: "",
      vehicle_model: "Toyota Camry 2025",
      license_number: "",
      status: "available",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d: Driver) => {
    setEditingDriver(d);
    setFormData(d);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete driver record?")) {
      await dataStore.deleteDriver(id);
      await loadDrivers();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone_number) return;

    const driverToSave: Driver = {
      id: editingDriver ? editingDriver.id : `drv-${Date.now()}`,
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      vehicle_plate: formData.vehicle_plate || "",
      vehicle_model: formData.vehicle_model || "",
      license_number: formData.license_number || "",
      status: formData.status || "available",
      is_active: formData.is_active ?? true,
    };

    await dataStore.saveDriver(driverToSave);
    setIsModalOpen(false);
    await loadDrivers();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "on_trip":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "off_duty":
        return "bg-slate-800 text-slate-400 border-slate-700";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        title="Chauffeurs & Driver Roster"
        subtitle="Manage Saudi TGA licensed chauffeurs allocated for airport meet-and-greets and pilgrim transfers"
        onRefresh={loadDrivers}
        onOpenNewBooking={openAddModal}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Total Chauffeurs: <span className="text-white font-bold">{drivers.length}</span> (
            {drivers.filter((d) => d.status === "available").length} Available for Dispatch)
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Chauffeur</span>
          </button>
        </div>

        {/* Drivers Table */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Chauffeur Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Assigned Vehicle</th>
                  <th className="py-3 px-4">Plate Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{d.full_name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>License: {d.license_number || "TGA-Verified"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {d.phone_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-amber-400">{d.vehicle_model}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {d.vehicle_plate || "KSA-9921"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getStatusBadge(d.status)}`}>
                        {d.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(d)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Add / Edit Driver */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users2 className="w-4 h-4 text-amber-400" />
                <span>{editingDriver ? "Edit Chauffeur" : "Add New Chauffeur"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Chauffeur Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Captain Tariq Al-Ghamdi"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+966 50 123 4567"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    placeholder="Toyota Camry 2025"
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Plate Number</label>
                  <input
                    type="text"
                    placeholder="KSA 4589"
                    value={formData.vehicle_plate}
                    onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="available">Available (Ready for Dispatch)</option>
                  <option value="on_trip">On Trip</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                Save Chauffeur
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
