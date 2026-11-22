'use client';

import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { SiteSetting } from "@/types";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSuccessKey, setSavedSuccessKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<"general" | "contact" | "service" | "homepage">("contact");
  const [showAddModal, setShowAddModal] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await dataStore.getSettings();
      setSettings(data);
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleValueChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSaveSetting = async (key: string) => {
    const item = settings.find((s) => s.key === key);
    if (!item) return;

    setSavingKey(key);
    try {
      await dataStore.updateSetting(key, item.value);
      setSavedSuccessKey(key);
      setTimeout(() => setSavedSuccessKey(null), 3000);
    } catch (err) {
      console.error("Failed to save setting:", err);
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveAll = async () => {
    setSavingKey("all");
    try {
      for (const item of settings) {
        await dataStore.updateSetting(item.key, item.value);
      }
      setSavedSuccessKey("all");
      setTimeout(() => setSavedSuccessKey(null), 3000);
    } catch (err) {
      console.error("Failed saving all settings:", err);
    } finally {
      setSavingKey(null);
    }
  };

  const handleAddNewSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    const formattedKey = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    await dataStore.updateSetting(formattedKey, newValue.trim());

    setNewKey("");
    setNewValue("");
    setNewLabel("");
    setShowAddModal(false);
    await loadSettings();
  };

  const isLive = dataStore.isLiveMode();

  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        title="Site Settings & Contact Configuration"
        subtitle="Manage dynamic phone numbers, WhatsApp hotlines, office addresses, and policies"
        onRefresh={loadSettings}
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Supabase Sync Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isLive
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
              : "bg-blue-950/20 border-blue-500/30 text-blue-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isLive ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isLive ? "Supabase Live Connected" : "Local Sandbox Storage Mode"}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Table: public.site_settings
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isLive
                  ? "All updates below instantly save to your live PostgreSQL database table `site_settings`."
                  : "Changes save to browser storage. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to sync directly to Supabase."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              disabled={savingKey === "all"}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingKey === "all" ? "Saving..." : "Save All Changes"}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Custom Key</span>
            </button>
          </div>
        </div>

        {savedSuccessKey && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {savedSuccessKey === "all"
                ? "All settings have been successfully updated!"
                : `Setting "${savedSuccessKey}" saved successfully!`}
            </span>
          </div>
        )}

        {/* Category: Contact & Communication */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Direct Contact & WhatsApp Dispatch Numbers
              </h2>
            </div>
            <span className="text-xs text-slate-400">Reflected across the main website & WhatsApp buttons</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* WhatsApp Dispatch Number */}
            {settings
              .filter((s) => s.key === "whatsapp_number" || s.key === "contact_phone" || s.key === "contact_email")
              .map((s) => (
                <div key={s.key} className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {s.key === "whatsapp_number" && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                      {s.key === "contact_phone" && <Phone className="w-3.5 h-3.5 text-amber-400" />}
                      {s.key === "contact_email" && <Mail className="w-3.5 h-3.5 text-blue-400" />}
                      <span>{s.label || s.key}</span>
                    </label>
                    <span className="font-mono text-[10px] text-slate-500">{s.key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s.value}
                      onChange={(e) => handleValueChange(s.key, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => handleSaveSetting(s.key)}
                      disabled={savingKey === s.key}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingKey === s.key ? "..." : "Save"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {s.key === "whatsapp_number" && "Format with country code without + or spaces (e.g. 966591206299)"}
                    {s.key === "contact_phone" && "Formatted phone display with spaces for pilgrim hotline"}
                    {s.key === "contact_email" && "Inbound support mailbox"}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Category: Physical Branch Addresses */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Physical Office & Dispatch Addresses
              </h2>
            </div>
            <span className="text-xs text-slate-400">Shown in footer and contact page</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {settings
              .filter((s) => s.key.includes("address"))
              .map((s) => (
                <div key={s.key} className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">{s.label || s.key}</label>
                    <span className="font-mono text-[10px] text-slate-500">{s.key}</span>
                  </div>
                  <textarea
                    rows={2}
                    value={s.value}
                    onChange={(e) => handleValueChange(s.key, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSaveSetting(s.key)}
                      disabled={savingKey === s.key}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingKey === s.key ? "Saving..." : "Save Address"}</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Category: Operational Policies & Guarantees */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Service Policies & Pilgrim Guarantees
              </h2>
            </div>
            <span className="text-xs text-slate-400">Terms rendered in booking forms & trust badges</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings
              .filter(
                (s) =>
                  !s.key.includes("address") &&
                  s.key !== "whatsapp_number" &&
                  s.key !== "contact_phone" &&
                  s.key !== "contact_email"
              )
              .map((s) => (
                <div key={s.key} className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-200">{s.label || s.key}</label>
                      <span className="font-mono text-[9px] text-slate-500">{s.key}</span>
                    </div>
                    <textarea
                      rows={2}
                      value={s.value}
                      onChange={(e) => handleValueChange(s.key, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleSaveSetting(s.key)}
                      disabled={savingKey === s.key}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>{savingKey === s.key ? "..." : "Save"}</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal: Add Custom Setting Key */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddNewSetting} className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Custom Site Setting</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Setting Key (Unique ID)</label>
                <input
                  type="text"
                  placeholder="e.g. emergency_hotline"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Human Label</label>
                <input
                  type="text"
                  placeholder="e.g. 24/7 Emergency Line"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Setting Value</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Value content"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                >
                  <option value="contact">Contact</option>
                  <option value="general">General</option>
                  <option value="service">Service</option>
                  <option value="homepage">Homepage</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                Add Setting
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
