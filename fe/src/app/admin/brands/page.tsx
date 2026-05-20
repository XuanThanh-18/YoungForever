"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type { BrandResponse } from "@/types";
import { Plus, Pencil, Trash2, X, Globe, RefreshCw } from "lucide-react";
import Image from "next/image";

interface BrandForm {
  name: string;
  slug: string;
  description: string;
  country: string;
  website: string;
  logoUrl: string;
}
const EMPTY: BrandForm = {
  name: "",
  slug: "",
  description: "",
  country: "",
  website: "",
  logoUrl: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ✅ Fetch inline — refreshKey là trigger duy nhất
  useEffect(() => {
    let cancelled = false;

    axiosInstance
      .get<{ data: BrandResponse[] }>("/brands")
      .then((res) => {
        if (!cancelled) setBrands(res.data.data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refreshBrands = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setShowModal(true);
  };
  const openEdit = (b: BrandResponse) => {
    setEditId(b.id);
    setForm({
      name: b.name,
      slug: b.slug,
      description: b.description ?? "",
      country: b.country ?? "",
      website: b.website ?? "",
      logoUrl: b.logoUrl ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await axiosInstance.put(`/brands/${editId}`, form);
      } else {
        await axiosInstance.post("/brands", form);
      }
      setShowModal(false);
      refreshBrands();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/brands/${id}`);
      setDeleteId(null);
      refreshBrands();
    } catch (err) {
      console.error(err);
    }
  };

  const setField = (k: keyof BrandForm, v: string) => {
    setForm((f) => {
      const updated = { ...f, [k]: v };
      if (k === "name" && !editId) updated.slug = slugify(v);
      return updated;
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Quản lý thương hiệu
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Thêm và chỉnh sửa thông tin thương hiệu
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshBrands}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium hover:bg-[#2d2320] transition-colors"
          >
            <Plus size={16} /> Thêm thương hiệu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-36 animate-pulse border border-stone-100"
              />
            ))
          : brands.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 group hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  {b.logoUrl ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-50">
                      <Image
                        src={b.logoUrl}
                        alt={b.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#E8A4B8]/20 flex items-center justify-center text-[#C4829A] font-bold text-lg">
                      {b.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded-lg text-stone-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteId(b.id)}
                      className="p-1.5 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-stone-800 text-sm">{b.name}</p>
                {b.country && (
                  <p className="text-xs text-stone-400 mt-0.5">{b.country}</p>
                )}
                {b.website && (
                  <a
                    href={b.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#C4829A] mt-2 hover:underline"
                  >
                    <Globe size={10} /> Website
                  </a>
                )}
                <span
                  className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${b.isActive ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}
                >
                  {b.isActive ? "Hoạt động" : "Ẩn"}
                </span>
              </div>
            ))}
        {!loading && brands.length === 0 && (
          <div className="col-span-4 py-16 text-center text-stone-400 text-sm">
            Chưa có thương hiệu nào
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-bold text-stone-800">
                {editId ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(
                [
                  {
                    key: "name" as const,
                    label: "Tên thương hiệu *",
                    mono: true,
                  },
                  { key: "slug" as const, label: "Slug", mono: false },
                  { key: "country" as const, label: "Quốc gia", mono: true },
                  { key: "website" as const, label: "Website", mono: false },
                  { key: "logoUrl" as const, label: "URL Logo", mono: false },
                ] as const
              ).map(({ key, label, mono }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    {label}
                  </label>
                  <input
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    className={`w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] ${mono ? "font-mono" : ""}`}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex-1 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium disabled:opacity-50 hover:bg-[#2d2320]"
              >
                {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-stone-800 mb-2">Xóa thương hiệu?</h3>
            <p className="text-sm text-stone-500 mb-6">
              Thương hiệu sẽ bị ẩn khỏi website.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
