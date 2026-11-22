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
import { getSupabaseCredentials, saveSupabaseCredentials, getSupabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSuccessKey, setSavedSuccessKey] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<"general" | "contact" | "service" | "homepage">("contact");
  const [showAddModal, setShowAddModal] = useState(false);

  // Supabase connection credentials
  const [supabaseUrlInput, setSupabaseUrlInput] = useState("");
  const [supabaseKeyInput, setSupabaseKeyInput] = useState("");
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    const creds = getSupabaseCredentials();
    setSupabaseUrlInput(creds.url);
    if (!creds.key.includes("placeholder")) {
      setSupabaseKeyInput(creds.key);
    }
  }, []);

  const handleConnectSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseKeyInput.trim()) {
      setSupabaseStatusMsg({ type: "error", text: "Please enter your Supabase Anon Public Key." });
      return;
    }

    setIsTestingSupabase(true);
    setSupabaseStatusMsg(null);

    try {
      const cleanUrl = supabaseUrlInput.trim() || "https://lbfmxgnxihujjcrzhjzn.supabase.co";
      const cleanKey = supabaseKeyInput.trim();
      saveSupabaseCredentials(cleanUrl, cleanKey);

      // Verify connection by querying site_settings table
      const client = getSupabase();
      const { data, error } = await client.from("site_settings").select("key").limit(1);

      if (!error) {
        setSupabaseStatusMsg({
          type: "success",
          text: "✅ Connected to Supabase PostgreSQL successfully! Live mode is now ACTIVE.",
        });
        await loadSettings();
      } else {
        setSupabaseStatusMsg({
          type: "error",
          text: `Connection failed: ${error.message}. Please verify the Anon key or run the setup SQL script in Supabase.`,
        });
      }
    } catch (err: any) {
      setSupabaseStatusMsg({
        type: "error",
        text: `Error connecting: ${err.message}`,
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSaveSetting = async (key: string) => {
    const item = settings.find((s) => s.key === key);
    if (!item) return;

    setSavingKey(key);
    setSaveErrorMsg(null);
    try {
      await dataStore.updateSetting(key, item.value);
      setSavedSuccessKey(key);
      setTimeout(() => setSavedSuccessKey(null), 3000);
    } catch (err: any) {
      console.error("Failed to save setting:", err);
      setSaveErrorMsg(err.message || "Failed to save setting in Supabase.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveAll = async () => {
    if (savingKey) return;
    setSavingKey("all");
    setSaveErrorMsg(null);
    try {
      await dataStore.saveAllSettings(settings);
      setSavedSuccessKey("all");
      setTimeout(() => setSavedSuccessKey(null), 3500);
      await loadSettings();
    } catch (err: any) {
      console.error("Failed saving all settings:", err);
      setSaveErrorMsg(err.message || "Failed to save settings to Supabase.");
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

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
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
              disabled={savingKey !== null}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-950 font-bold text-xs shadow-md transition-all ${
                savingKey === "all"
                  ? "bg-amber-400 opacity-80 cursor-wait"
                  : "bg-amber-500 hover:bg-amber-400 cursor-pointer disabled:opacity-50"
              }`}
            >
              {savingKey === "all" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Saving All Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
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
                ? "All settings have been successfully updated in Supabase!"
                : `Setting "${savedSuccessKey}" saved successfully in Supabase!`}
            </span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <div className="flex-1">
              <span className="font-bold block">Supabase Permission / RLS Error:</span>
              <span>{saveErrorMsg}</span>
              <p className="mt-1 text-[11px] text-rose-400/90">
                Tip: Run the RLS Policy fix query in your Supabase SQL Editor to grant update permissions.
              </p>
            </div>
          </div>
        )}

        {/* Supabase Live API Connection Card */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Supabase PostgreSQL Live Database Gateway
                </h2>
                <p className="text-xs text-slate-400">
                  Connect your live Supabase credentials to switch from Demo mode to Live mode
                </p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                isLive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`}></span>
              <span>{isLive ? "● LIVE DATABASE ACTIVE" : "○ DEMO STORAGE MODE"}</span>
            </div>
          </div>

          {supabaseStatusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                supabaseStatusMsg.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              <span>{supabaseStatusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleConnectSupabase} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://lbfmxgnxihujjcrzhjzn.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Supabase Anon Public Key (anon key)
                </label>
                <input
                  type="password"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-500">
                Pasted key is securely stored in your browser session and connects directly to your PostgreSQL database.
              </p>
              <button
                type="submit"
                disabled={isTestingSupabase}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 shrink-0"
              >
                {isTestingSupabase ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Connect & Switch to Supabase Live</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

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
            {/* WhatsApp Dispatch Number & Direct Contact */}
            {settings
              .filter(
                (s) =>
                  s.key === "whatsapp_number" ||
                  s.key === "phone_number" ||
                  s.key === "contact_phone" ||
                  s.key === "support_email" ||
                  s.key === "contact_email"
              )
              .map((s) => (
                <div key={s.key} className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {s.key === "whatsapp_number" && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                      {(s.key === "phone_number" || s.key === "contact_phone") && <Phone className="w-3.5 h-3.5 text-amber-400" />}
                      {(s.key === "support_email" || s.key === "contact_email") && <Mail className="w-3.5 h-3.5 text-blue-400" />}
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
                    {(s.key === "phone_number" || s.key === "contact_phone") && "Formatted phone display with spaces for pilgrim hotline"}
                    {(s.key === "support_email" || s.key === "contact_email") && "Inbound support mailbox"}
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
                  s.key !== "contact_email" &&
                  s.key !== "phone_number" &&
                  s.key !== "support_email"
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
