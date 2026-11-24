'use client';

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Clock,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { Route } from "@/types";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { generateUUID } from "@/lib/utils";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Route>>({
    slug: "",
    title: "",
    origin_city: "Jeddah",
    destination_city: "Makkah",
    distance_km: 95,
    duration_mins: 75,
    is_popular: false,
    display_order: 1,
    is_active: true,
  });

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const data = await dataStore.getRoutes();
      setRoutes(data);
    } catch (err) {
      console.error("Error loading routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const openAddModal = () => {
    setEditingRoute(null);
    setFormData({
      slug: "",
      title: "",
      origin_city: "Jeddah",
      destination_city: "Makkah",
      distance_km: 95,
      duration_mins: 75,
      is_popular: false,
      display_order: routes.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (r: Route) => {
    setEditingRoute(r);
    setFormData(r);
    setIsModalOpen(true);
  };

  const handleTogglePopular = async (r: Route) => {
    const updated = { ...r, is_popular: !r.is_popular };
    await dataStore.saveRoute(updated);
    await loadRoutes();
  };

  const handleToggleActive = async (r: Route) => {
    const updated = { ...r, is_active: !r.is_active };
    await dataStore.saveRoute(updated);
    await loadRoutes();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this route from catalog?")) {
      await dataStore.deleteRoute(id);
      await loadRoutes();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const slug =
      formData.slug ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const routeToSave: Route = {
      id: editingRoute ? editingRoute.id : generateUUID(),
      slug,
      title: formData.title,
      origin_city: formData.origin_city || "Jeddah",
      destination_city: formData.destination_city || "Makkah",
      distance_km: Number(formData.distance_km) || 95,
      duration_mins: Number(formData.duration_mins) || 75,
      is_popular: formData.is_popular ?? false,
      display_order: Number(formData.display_order) || 1,
      is_active: formData.is_active ?? true,
    };

    await dataStore.saveRoute(routeToSave);
    setIsModalOpen(false);
    await loadRoutes();
  };

  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        title="Routes & Pilgrim Corridors"
        subtitle="Manage transfer corridors between Jeddah Airport, Makkah, Madinah, and Holy Ziyarat excursions"
        onRefresh={loadRoutes}
        onOpenNewBooking={openAddModal}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Total Corridors: <span className="text-white font-bold">{routes.length} Routes</span> (
            {routes.filter((r) => r.is_active).length} Active)
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Route</span>
          </button>
        </div>

        {/* Routes Table */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Route Title & Slug</th>
                  <th className="py-3 px-4">Origin & Destination</th>
                  <th className="py-3 px-4">Distance & Duration</th>
                  <th className="py-3 px-4">Popular</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {routes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500">#{r.display_order}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{r.title}</div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5">/{r.slug}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="font-semibold text-white">{r.origin_city}</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="font-semibold text-amber-400">{r.destination_city}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-semibold">{r.distance_km} km</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>~{r.duration_mins} mins</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleTogglePopular(r)}
                        className={`text-xs px-2 py-0.5 rounded border cursor-pointer font-semibold flex items-center gap-1 ${
                          r.is_popular
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}
                      >
                        <Star className={`w-3 h-3 ${r.is_popular ? "fill-amber-400" : ""}`} />
                        <span>{r.is_popular ? "Popular" : "Standard"}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(r)}
                        className={`text-xs px-2.5 py-0.5 rounded-full border cursor-pointer font-semibold ${
                          r.is_active
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {r.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Edit Route"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                          title="Delete Route"
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

      {/* Modal: Add / Edit Route */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{editingRoute ? "Edit Route" : "Add New Route"}</span>
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
                <label className="text-slate-300 font-semibold block mb-1">Route Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jeddah Airport (KAIA) to Makkah Hotel"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Descriptive name for customer route selection</p>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. jeddah-airport-to-makkah"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Lowercase hyphenated identifier for SEO URLs</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Origin City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jeddah"
                    value={formData.origin_city}
                    onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Starting city or airport</p>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Destination City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Makkah"
                    value={formData.destination_city}
                    onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Arrival city or hotel area</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Distance (km)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 95"
                    value={formData.distance_km}
                    onChange={(e) => setFormData({ ...formData, distance_km: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Road distance in km</p>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 60"
                    value={formData.duration_mins}
                    onChange={(e) => setFormData({ ...formData, duration_mins: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Drive time in minutes</p>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Order</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Display sequence</p>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Mark as Popular Route</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Active in Booking Engine</span>
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
                Save Route
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
