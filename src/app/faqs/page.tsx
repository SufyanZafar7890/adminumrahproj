'use client';

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  Search,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { FAQ } from "@/types";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { generateUUID } from "@/lib/utils";

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: "",
    answer: "",
    category: "Booking & Payments",
    display_order: 1,
    is_active: true,
  });

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const data = await dataStore.getFAQs();
      setFaqs(data);
    } catch (err) {
      console.error("Error loading FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const openAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      category: "Booking & Payments",
      display_order: faqs.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (f: FAQ) => {
    setEditingFaq(f);
    setFormData(f);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this FAQ item?")) {
      await dataStore.deleteFAQ(id);
      await loadFaqs();
    }
  };

  const handleToggleActive = async (f: FAQ) => {
    const updated = { ...f, is_active: !f.is_active };
    await dataStore.saveFAQ(updated);
    await loadFaqs();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) return;

    const faqToSave: FAQ = {
      id: editingFaq ? editingFaq.id : generateUUID(),
      question: formData.question,
      answer: formData.answer,
      category: formData.category || "General",
      display_order: Number(formData.display_order) || 1,
      is_active: formData.is_active ?? true,
    };

    await dataStore.saveFAQ(faqToSave);
    setIsModalOpen(false);
    await loadFaqs();
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        title="Frequently Asked Questions (FAQs)"
        subtitle="Manage dynamic questions, pilgrim booking answers, Miqat guides, and payment FAQs"
        onRefresh={loadFaqs}
        onOpenNewBooking={openAddModal}
      />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search FAQ questions & answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c1220] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New FAQ</span>
          </button>
        </div>

        {/* FAQs List */}
        <div className="space-y-3">
          {filteredFaqs.map((f) => (
            <div
              key={f.id}
              className={`p-4 rounded-2xl border transition-all ${f.is_active
                  ? "bg-[#0c1220] border-slate-800 hover:border-slate-700 shadow-sm"
                  : "bg-slate-950/60 border-slate-800/40 opacity-60"
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                      {f.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Order #{f.display_order}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{f.question}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">{f.answer}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(f)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${f.is_active
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      }`}
                  >
                    {f.is_active ? "Active" : "Hidden"}
                  </button>
                  <button
                    onClick={() => openEditModal(f)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Edit FAQ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add / Edit FAQ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-5 pb-4 shrink-0 bg-[#0c1220]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1 overscroll-contain">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Do I need to pay an advance deposit?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Frequently asked question by pilgrims</p>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Answer *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. No, we require zero advance deposit. You pay your chauffeur upon safe arrival..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Reassuring and detailed solution text</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Booking & Payments"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Filter tab name</p>
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
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Sort priority</p>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500"
                  />
                  <span>Active & Displayed on Website</span>
                </label>
              </div>
            </div>

            <div className="p-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-[#0c1220] shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              >
                Save FAQ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
