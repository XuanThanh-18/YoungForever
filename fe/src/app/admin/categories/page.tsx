"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type { CategoryResponse } from "@/types";
import { Plus, Pencil, Trash2, X, ChevronRight } from "lucide-react";

interface CatForm {
  name: string;
  slug: string;
  description: string;
  parentId: string;
}
const EMPTY: CatForm = { name: "", slug: "", description: "", parentId: "" };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CatForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ✅ Fetch inline
  useEffect(() => {
    let cancelled = false;

    axiosInstance
      .get<{ data: CategoryResponse[] }>("/categories")
      .then((res) => {
        if (!cancelled) setCategories(res.data.data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refreshCategories = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setShowModal(true);
  };
  const openEdit = (c: CategoryResponse) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      parentId: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, parentId: form.parentId || null };
      if (editId) {
        await axiosInstance.put(`/categories/${editId}`, payload);
      } else {
        await axiosInstance.post("/categories", payload);
      }
      setShowModal(false);
      refreshCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
      setDeleteId(null);
      refreshCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const setField = (k: keyof CatForm, v: string) => {
    setForm((f) => {
      const updated = { ...f, [k]: v };
      if (k === "name" && !editId) updated.slug = slugify(v);
      return updated;
    });
  };

  // Flatten tree for table display
  const flat: Array<CategoryResponse & { depth: number }> = [];
  const flatten = (items: CategoryResponse[], depth = 0) => {
    items.forEach((c) => {
      flat.push({ ...c, depth });
      if (c.children?.length) flatten(c.children, depth + 1);
    });
  };
  flatten(categories);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Quản lý danh mục
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Tạo và chỉnh sửa danh mục sản phẩm
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium hover:bg-[#2d2320] transition-colors"
        >
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-stone-400 uppercase tracking-wide bg-stone-50 border-b border-stone-100">
              <th className="text-left px-6 py-3 font-medium">Tên danh mục</th>
              <th className="text-left px-6 py-3 font-medium">Slug</th>
              <th className="text-left px-6 py-3 font-medium">Danh mục con</th>
              <th className="px-6 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-stone-50">
                    {[...Array(4)].map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : flat.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-stone-50 hover:bg-stone-50/50"
                  >
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: c.depth * 20 }}
                      >
                        {c.depth > 0 && (
                          <ChevronRight size={12} className="text-stone-300" />
                        )}
                        <span
                          className={
                            c.depth === 0
                              ? "font-semibold text-stone-800"
                              : "text-stone-600"
                          }
                        >
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-400">
                      {c.slug}
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {c.children?.length ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-stone-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 rounded-lg text-stone-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            {!loading && flat.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-stone-400"
                >
                  Chưa có danh mục nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-bold text-stone-800">
                {editId ? "Cập nhật danh mục" : "Thêm danh mục"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Tên danh mục *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Danh mục cha
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => setField("parentId", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white"
                >
                  <option value="">— Không có (danh mục gốc) —</option>
                  {categories.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
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
            <h3 className="font-bold text-stone-800 mb-2">Xóa danh mục?</h3>
            <p className="text-sm text-stone-500 mb-6">
              Các sản phẩm trong danh mục này sẽ không bị xóa.
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
