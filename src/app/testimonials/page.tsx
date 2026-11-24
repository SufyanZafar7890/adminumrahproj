'use client';

import React, { useEffect, useState } from "react";
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Globe,
  MessageSquare,
} from "lucide-react";
import { dataStore } from "@/lib/storage";
import { Testimonial } from "@/types";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { generateUUID } from "@/lib/utils";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: "",
    country: "United Kingdom",
    rating: 5,
    review_text: "",
    trip_date: "November 2026",
    is_verified: true,
    display_order: 1,
    is_active: true,
  });

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const data = await dataStore.getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error("Error loading testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
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
    setEditingTestimonial(null);
    setFormData({
      name: "",
      country: "United Kingdom",
      rating: 5,
      review_text: "",
      trip_date: "November 2026",
      is_verified: true,
      display_order: testimonials.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setFormData(t);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this pilgrim review?")) {
      await dataStore.deleteTestimonial(id);
      await loadTestimonials();
    }
  };

  const handleToggleActive = async (t: Testimonial) => {
    const updated = { ...t, is_active: !t.is_active };
    await dataStore.saveTestimonial(updated);
    await loadTestimonials();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.review_text) return;

    const testimonialToSave: Testimonial = {
      id: editingTestimonial ? editingTestimonial.id : generateUUID(),
      name: formData.name,
      country: formData.country || "Pilgrim",
      rating: Number(formData.rating) || 5,
      review_text: formData.review_text,
      trip_date: formData.trip_date || "Recent",
      is_verified: formData.is_verified ?? true,
      display_order: Number(formData.display_order) || 1,
      is_active: formData.is_active ?? true,
    };

    await dataStore.saveTestimonial(testimonialToSave);
    setIsModalOpen(false);
    await loadTestimonials();
  };

  return (
    <div className="min-h-screen pb-16">
      <AdminHeader
        title="Testimonials & Pilgrim Reviews"
        subtitle="Manage verified pilgrim reviews, ratings, and testimonials shown on the website"
        onRefresh={loadTestimonials}
        onOpenNewBooking={openAddModal}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Total Reviews: <span className="text-white font-bold">{testimonials.length}</span> (
            {testimonials.filter((t) => t.is_active).length} Active on site)
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Review</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                t.is_active
                  ? "bg-[#0c1220] border-slate-800 hover:border-slate-700 shadow-sm"
                  : "bg-slate-950/60 border-slate-800/40 opacity-60"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < t.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleToggleActive(t)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                      t.is_active
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {t.is_active ? "Published" : "Hidden"}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-4">
                  "{t.review_text}"
                </p>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{t.name}</h4>
                    <span className="text-[11px] text-slate-400">{t.country} • {t.trip_date}</span>
                  </div>
                  {t.is_verified && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Edit Review"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add / Edit Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0c1220] border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-5 pb-4 shrink-0 bg-[#0c1220]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>{editingTestimonial ? "Edit Review" : "Add New Pilgrim Review"}</span>
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
                <label className="text-slate-300 font-semibold block mb-1">Pilgrim Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haji Muhammad Farooq"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Pilgrim customer name</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Country / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Birmingham, United Kingdom"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Pilgrim's home location</p>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Rating (Stars)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Review score (1-5)</p>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Review Experience *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write the pilgrim's feedback (e.g. Masha'Allah exceptional chauffeur service! Punctual at KAIA airport...)"
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Genuine testimonial quotes for trust building</p>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Trip Date / Season</label>
                <input
                  type="text"
                  placeholder="e.g. Ramadan 2026 or October 2026"
                  value={formData.trip_date}
                  onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">💡 Hint: Travel period</p>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500"
                  />
                  <span>Verified Pilgrim Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500"
                  />
                  <span>Active on Website</span>
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
                Save Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
