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
  Users,
  Building2,
  Award,
  FileText,
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

  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showAddModal]);

  const handleValueChange = (key: string, value: string) => {
    if (key === "whatsapp_number" || key === "phone_number" || key === "contact_phone") {
      setSettings((prev) => {
        // Ensure both whatsapp_number and phone_number exist and are kept in sync
        const keysToSync = ["whatsapp_number", "phone_number"];
        const updated = prev.map((s) =>
          keysToSync.includes(s.key) || s.key === "contact_phone" ? { ...s, value } : s
        );
        for (const k of keysToSync) {
          if (!updated.some((s) => s.key === k)) {
            updated.push({
              id: `set-${Date.now()}-${k}`,
              key: k,
              value,
              label: k === "whatsapp_number" ? "Unified WhatsApp & Hotline" : "Hotline Phone Number",
              category: "contact",
              updated_at: new Date().toISOString(),
            });
          }
        }
        return updated;
      });
    } else {
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value } : s))
      );
    }
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
              <span className="font-bold block">Database Permission / RLS Error:</span>
              <span>{saveErrorMsg}</span>
              <p className="mt-1 text-[11px] text-rose-400/90">
                Tip: Run the RLS Policy fix query in your Supabase SQL Editor to grant update permissions.
              </p>
            </div>
          </div>
        )}

        {/* Category: Contact & Communication */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Direct Contact & WhatsApp Dispatch (Unified)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Reflected across the main website & WhatsApp buttons</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Unified Contact & WhatsApp Hotline */}
            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official Contact & WhatsApp Dispatch Hotline</span>
                </label>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  whatsapp_number &amp; phone_number
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 923160424995 or 966591206299"
                  value={settings.find((s) => s.key === "whatsapp_number")?.value || settings.find((s) => s.key === "phone_number")?.value || ""}
                  onChange={(e) => handleValueChange("whatsapp_number", e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSaveSetting("whatsapp_number")}
                  disabled={savingKey === "whatsapp_number"}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "whatsapp_number" ? "..." : "Save"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Single unified number powering all website phone call links, WhatsApp chat triggers, route inquiries, and booking dispatch. Enter with country code without '+' or spaces.
              </p>
            </div>

            {/* Official Support Email */}
            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Official Support & Dispatch Email</span>
                </label>
                <span className="font-mono text-[10px] text-slate-500">support_email</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="e.g. dispatch@umrahtaxionline.com"
                  value={settings.find((s) => s.key === "support_email")?.value || ""}
                  onChange={(e) => handleValueChange("support_email", e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSaveSetting("support_email")}
                  disabled={savingKey === "support_email"}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "support_email" ? "..." : "Save"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Primary customer inquiry and chauffeur booking notification mailbox displayed in headers &amp; footers.
              </p>
            </div>
          </div>
        </div>

        {/* Category: Brand Identity, Founder & About Us Story */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Brand Identity, Founder &amp; About Us Story
              </h2>
            </div>
            <span className="text-xs text-slate-400">Dynamically reflected on the About Us page, Navbar &amp; Footer</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Founder Name */}
            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Founder / Chief Executive Name</span>
                </label>
                <span className="font-mono text-[10px] text-slate-500">founder_name</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Sufyan Zafar"
                  value={settings.find((s) => s.key === "founder_name")?.value || ""}
                  onChange={(e) => handleValueChange("founder_name", e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSaveSetting("founder_name")}
                  disabled={savingKey === "founder_name"}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "founder_name" ? "..." : "Save"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Founder name dynamically reflected across the About Us story and executive sign-offs.
              </p>
            </div>

            {/* Operating Company / Brand Name */}
            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Operating Brand / Company Name</span>
                </label>
                <span className="font-mono text-[10px] text-slate-500">company_name</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Umrah Taxi Online"
                  value={settings.find((s) => s.key === "company_name")?.value || ""}
                  onChange={(e) => handleValueChange("company_name", e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSaveSetting("company_name")}
                  disabled={savingKey === "company_name"}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "company_name" ? "..." : "Save"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Main brand name rendered in website navbar, footers, and official documents.
              </p>
            </div>

            {/* About Mission Headline */}
            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>About Us Mission Headline</span>
                </label>
                <span className="font-mono text-[10px] text-slate-500">about_mission_title</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Serving the Guests of Allah"
                  value={settings.find((s) => s.key === "about_mission_title")?.value || ""}
                  onChange={(e) => handleValueChange("about_mission_title", e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSaveSetting("about_mission_title")}
                  disabled={savingKey === "about_mission_title"}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "about_mission_title" ? "..." : "Save"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Primary headline displayed on the customer About Us page.
              </p>
            </div>

            {/* Founding Story Heading */}
            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Founding Story Heading</span>
                </label>
                <span className="font-mono text-[10px] text-slate-500">about_story_title</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Our Founding Story"
                  value={settings.find((s) => s.key === "about_story_title")?.value || ""}
                  onChange={(e) => handleValueChange("about_story_title", e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSaveSetting("about_story_title")}
                  disabled={savingKey === "about_story_title"}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "about_story_title" ? "..." : "Save"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Title of the narrative section on About Us page.
              </p>
            </div>

            {/* About Mission Narrative Text */}
            <div className="col-span-1 md:col-span-2 space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">About Us Mission Statement</label>
                <span className="font-mono text-[10px] text-slate-500">about_mission_text</span>
              </div>
              <textarea
                rows={2}
                placeholder="Headquartered in Ash Shubaikah, Makkah, adjacent to the Holy Mosque..."
                value={settings.find((s) => s.key === "about_mission_text")?.value || ""}
                onChange={(e) => handleValueChange("about_mission_text", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400">
                  💡 Hint: Main introductory paragraph on About Us page.
                </p>
                <button
                  onClick={() => handleSaveSetting("about_mission_text")}
                  disabled={savingKey === "about_mission_text"}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 ml-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "about_mission_text" ? "..." : "Save"}</span>
                </button>
              </div>
            </div>

            {/* Founding Story Paragraph 1 */}
            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Founding Story Paragraph 1</label>
                <span className="font-mono text-[10px] text-slate-500">about_story_text_1</span>
              </div>
              <textarea
                rows={3}
                placeholder="Founded by our team, our service started with a simple belief..."
                value={settings.find((s) => s.key === "about_story_text_1")?.value || ""}
                onChange={(e) => handleValueChange("about_story_text_1", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400">
                  💡 Hint: First narrative block in the story box.
                </p>
                <button
                  onClick={() => handleSaveSetting("about_story_text_1")}
                  disabled={savingKey === "about_story_text_1"}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 ml-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "about_story_text_1" ? "..." : "Save"}</span>
                </button>
              </div>
            </div>

            {/* Founding Story Paragraph 2 */}
            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Founding Story Paragraph 2</label>
                <span className="font-mono text-[10px] text-slate-500">about_story_text_2</span>
              </div>
              <textarea
                rows={3}
                placeholder="Unlike automated ride apps that apply high surge pricing..."
                value={settings.find((s) => s.key === "about_story_text_2")?.value || ""}
                onChange={(e) => handleValueChange("about_story_text_2", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400">
                  💡 Hint: Second narrative block highlighting pilgrim guarantees.
                </p>
                <button
                  onClick={() => handleSaveSetting("about_story_text_2")}
                  disabled={savingKey === "about_story_text_2"}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 ml-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "about_story_text_2" ? "..." : "Save"}</span>
                </button>
              </div>
            </div>

            {/* Drivers Stat & Pilgrims Stat */}
            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Verified Chauffeurs Count Stat</label>
                <span className="font-mono text-[10px] text-slate-500">about_stat_drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 50+"
                  value={settings.find((s) => s.key === "about_stat_drivers")?.value || ""}
                  onChange={(e) => handleValueChange("about_stat_drivers", e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSaveSetting("about_stat_drivers")}
                  disabled={savingKey === "about_stat_drivers"}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "about_stat_drivers" ? "..." : "Save"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Number displayed in the driver fleet stats metric box.
              </p>
            </div>

            <div className="space-y-1.5 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Pilgrims Transported Count Stat</label>
                <span className="font-mono text-[10px] text-slate-500">about_stat_pilgrims</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 10,000+"
                  value={settings.find((s) => s.key === "about_stat_pilgrims")?.value || ""}
                  onChange={(e) => handleValueChange("about_stat_pilgrims", e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleSaveSetting("about_stat_pilgrims")}
                  disabled={savingKey === "about_stat_pilgrims"}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "about_stat_pilgrims" ? "..." : "Save"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Hint: Total pilgrim trust metric counter.
              </p>
            </div>
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
                    placeholder="e.g. Ash Shubaikah, Makkah 24231, Kingdom of Saudi Arabia"
                    value={s.value}
                    onChange={(e) => handleValueChange(s.key, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-slate-400">
                      💡 Hint: Physical dispatch office or headquarters address shown in site footer &amp; contact page.
                    </p>
                    <button
                      onClick={() => handleSaveSetting(s.key)}
                      disabled={savingKey === s.key}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 ml-2"
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
                  !s.key.startsWith("about_") &&
                  s.key !== "founder_name" &&
                  s.key !== "company_name" &&
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
                      placeholder={
                        s.key === "hero_heading"
                          ? "e.g. Private Umrah Taxi With Zero Advance Deposit"
                          : s.key === "hero_subheading"
                          ? "e.g. Pre-book your sanitized private chauffeur..."
                          : s.key === "sla_response_time"
                          ? "e.g. 1 – 2 Minutes"
                          : s.key === "tga_compliance_text"
                          ? "e.g. Saudi Transport General Authority (TGA) Compliant..."
                          : "Setting value..."
                      }
                      value={s.value}
                      onChange={(e) => handleValueChange(s.key, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {s.key === "hero_heading" && "💡 Hint: Main high-impact headline displayed on homepage hero banner."}
                      {s.key === "hero_subheading" && "💡 Hint: Value proposition explaining zero advance deposit and flight tracking."}
                      {s.key === "sla_response_time" && "💡 Hint: Dispatch team expected response window (e.g. 1 – 2 Minutes)."}
                      {s.key === "tga_compliance_text" && "💡 Hint: Regulatory licensing text for Saudi TGA compliance badge."}
                      {s.key === "company_name" && "💡 Hint: Official brand name rendered on documents and headers."}
                      {s.key === "founder_name" && "💡 Hint: Founder or chief executive signature."}
                      {!["hero_heading", "hero_subheading", "sla_response_time", "tga_compliance_text", "company_name", "founder_name"].includes(s.key) &&
                        "💡 Hint: Value dynamically rendered on customer frontend."}
                    </p>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleAddNewSetting}
            className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-5 pb-4 shrink-0 bg-[#0c1220]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Custom Site Setting</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1 overscroll-contain">
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
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: lowercase_key_with_underscores (e.g. airport_counter_number)</p>
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
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Readable name displayed on admin cards</p>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Setting Value</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. +966 59 123 4567"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: String or JSON content stored in Supabase</p>
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
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Determines which section this setting appears under</p>
              </div>
            </div>

            <div className="p-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-[#0c1220] shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
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
