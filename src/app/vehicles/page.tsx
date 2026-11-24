'use client';

import React, { useEffect, useState } from "react";
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  ExternalLink,
  Save,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { Vehicle } from "@/types";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: "",
    category: "Sedan",
    max_passengers: 4,
    max_luggage: 2,
    image_url: "",
    features: ["Air Conditioned", "Clean Interior"],
    display_order: 1,
    is_active: true,
  });

  const [featuresInput, setFeaturesInput] = useState("");

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await dataStore.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error("Error loading vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      name: "",
      category: "Sedan",
      max_passengers: 4,
      max_luggage: 2,
      image_url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80",
      features: ["Air Conditioned", "Dual Airbags", "Spacious Legroom"],
      display_order: vehicles.length + 1,
      is_active: true,
    });
    setFeaturesInput("Air Conditioned, Dual Airbags, Spacious Legroom");
    setIsModalOpen(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData(v);
    setFeaturesInput((v.features || []).join(", "));
    setIsModalOpen(true);
  };

  const handleToggleActive = async (v: Vehicle) => {
    const updated = { ...v, is_active: !v.is_active };
    await dataStore.saveVehicle(updated);
    await loadVehicles();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this vehicle from fleet?")) {
      await dataStore.deleteVehicle(id);
      await loadVehicles();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const featureList = featuresInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const vehicleToSave: Vehicle = {
      id: editingVehicle ? editingVehicle.id : `veh-${Date.now()}`,
      name: formData.name || "Untitled Vehicle",
      category: formData.category || "Sedan",
      max_passengers: Number(formData.max_passengers) || 4,
      max_luggage: Number(formData.max_luggage) || 2,
      image_url: formData.image_url || "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80",
      features: featureList,
      display_order: Number(formData.display_order) || 1,
      is_active: formData.is_active ?? true,
    };

    await dataStore.saveVehicle(vehicleToSave);
    setIsModalOpen(false);
    await loadVehicles();
  };

  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        title="Fleet & Vehicles Management"
        subtitle="Manage available vehicle models, passenger capacities, luggage specs, and photos"
        onRefresh={loadVehicles}
        onOpenNewBooking={openAddModal}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Total Fleet: <span className="text-white font-bold">{vehicles.length} Models</span> (
            {vehicles.filter((v) => v.is_active).length} Active for pilgrim bookings)
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Vehicle</span>
          </button>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                v.is_active
                  ? "bg-[#0c1220] border-slate-800 hover:border-slate-700 shadow-sm"
                  : "bg-slate-950/60 border-slate-800/40 opacity-60"
              }`}
            >
              <div>
                {/* Vehicle Image */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden group">
                  <img
                    src={v.image_url}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
                      {v.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleActive(v)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                        v.is_active
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                      }`}
                    >
                      {v.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">{v.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>{v.max_passengers} Pax</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        <span>{v.max_luggage} Bags</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(v.features || []).slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded"
                      >
                        {f}
                      </span>
                    ))}
                    {(v.features || []).length > 3 && (
                      <span className="text-[10px] text-slate-500 px-1 py-0.5">
                        +{v.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Order: #{v.display_order}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(v)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Edit Vehicle"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add / Edit Vehicle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span>{editingVehicle ? "Edit Vehicle" : "Add New Fleet Vehicle"}</span>
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
                <label className="text-slate-300 font-semibold block mb-1">Vehicle Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GMC Yukon XL 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Vehicle name and model year displayed to pilgrims</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="MPV">MPV</option>
                    <option value="VIP SUV">VIP SUV</option>
                    <option value="Minibus">Minibus</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Fleet tier classification</p>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Display Order</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Sort priority (lower number displays first)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Max Passengers (Seats)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 7"
                    value={formData.max_passengers}
                    onChange={(e) => setFormData({ ...formData, max_passengers: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Maximum passenger seating capacity</p>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Max Luggage (Bags)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 6"
                    value={formData.max_luggage}
                    onChange={(e) => setFormData({ ...formData, max_luggage: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Standard suitcase trunk capacity</p>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Direct image web link for fleet showcase cards</p>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Features (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Air Conditioned, Dual Airbags, Spacious Legroom"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: List amenities separated by commas</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="veh_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="veh_active" className="text-slate-300 text-xs font-semibold">
                  Active (Available for online booking)
                </label>
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
                Save Vehicle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
