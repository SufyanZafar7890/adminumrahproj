'use client';

import React, { useEffect, useState } from "react";
import {
  CircleDollarSign,
  Car,
  MapPin,
  Save,
  CheckCircle2,
  RefreshCw,
  Search,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { Route, Vehicle, RoutePricing } from "@/types";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function PricingMatrixPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pricing, setPricing] = useState<RoutePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedCell, setSavedCell] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, v, p] = await Promise.all([
        dataStore.getRoutes(),
        dataStore.getVehicles(),
        dataStore.getPricing(),
      ]);
      setRoutes(r);
      setVehicles(v);
      setPricing(p);
    } catch (err) {
      console.error("Error loading pricing matrix:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPrice = (routeId: string, vehicleId: string): number => {
    const entry = pricing.find(
      (p) => p.route_id === routeId && p.vehicle_id === vehicleId
    );
    return entry ? entry.price_sar : 0;
  };

  const handlePriceChange = (routeId: string, vehicleId: string, value: string) => {
    const num = Number(value);
    setPricing((prev) => {
      const idx = prev.findIndex((p) => p.route_id === routeId && p.vehicle_id === vehicleId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], price_sar: num };
        return copy;
      } else {
        return [...prev, { id: `prc-${Date.now()}`, route_id: routeId, vehicle_id: vehicleId, price_sar: num }];
      }
    });
  };

  const handleSavePrice = async (routeId: string, vehicleId: string) => {
    const price = getPrice(routeId, vehicleId);
    await dataStore.updatePrice(routeId, vehicleId, price);
    const cellKey = `${routeId}_${vehicleId}`;
    setSavedCell(cellKey);
    setTimeout(() => setSavedCell(null), 2000);
  };

  const filteredRoutes = routes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        title="Live Route Pricing Matrix"
        subtitle="Dynamically adjust Saudi Riyal (SAR) rates for every route and vehicle combination"
        onRefresh={loadData}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Direct Dynamic Price Synchronization</h2>
              <p className="text-xs text-slate-400">
                Any changes made to these rates directly reflect on the customer booking calculator instantly.
              </p>
            </div>
          </div>

          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search route (e.g. Makkah, Jeddah, Madinah)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 -mt-2 px-1">
          💡 Hint: Enter fixed transfer fares in SAR. Click checkmark or press Enter to commit rate to database.
        </p>

        {/* Matrix Table */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-semibold">
                <tr>
                  <th className="py-4 px-4 min-w-[260px] sticky left-0 bg-[#0c1220] z-10 border-r border-slate-800">
                    Route / Corridor
                  </th>
                  {vehicles.map((v) => (
                    <th key={v.id} className="py-4 px-4 text-center min-w-[150px]">
                      <div className="font-bold text-white">{v.name}</div>
                      <div className="text-[10px] text-amber-400 font-normal uppercase">
                        {v.category} ({v.max_passengers} Pax)
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRoutes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/30 transition-colors">
                    {/* Route column */}
                    <td className="py-3 px-4 sticky left-0 bg-[#0c1220] z-10 border-r border-slate-800">
                      <div className="font-bold text-white">{r.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{r.distance_km} km</span>
                        <span>•</span>
                        <span>~{r.duration_mins} mins</span>
                      </div>
                    </td>

                    {/* Vehicle Price Cells */}
                    {vehicles.map((v) => {
                      const price = getPrice(r.id, v.id);
                      const cellKey = `${r.id}_${v.id}`;
                      const isSaved = savedCell === cellKey;

                      return (
                        <td key={v.id} className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 focus-within:border-amber-500 transition-all">
                            <input
                              type="number"
                              value={price || ""}
                              placeholder="0"
                              onChange={(e) => handlePriceChange(r.id, v.id, e.target.value)}
                              onBlur={() => handleSavePrice(r.id, v.id)}
                              className="w-16 bg-transparent text-center font-bold text-emerald-400 text-xs focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500 font-semibold pr-1">SAR</span>
                            <button
                              onClick={() => handleSavePrice(r.id, v.id)}
                              title="Save Rate"
                              className={`p-1 rounded-md transition-all ${
                                isSaved
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                              }`}
                            >
                              {isSaved ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
