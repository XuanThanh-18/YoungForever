"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type { BrandResponse, PageResponse } from "@/types";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────
interface BrandForm {
  name: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  country: string;
  website: string;
}

const EMPTY_FORM: BrandForm = {
  name: "",
  logoUrl: "",
  bannerUrl: "",
  description: "",
  country: "",
  website: "",
};

// ── Component ────────────────────────────────────────────────
export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch brands
  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);

      const params = new URLSearchParams({ page: String(page), size: "15" });
      if (search) params.set("keyword", search);

      axiosInstance
        .get<{ data: PageResponse<BrandResponse> }>(`/admin/brands?${params}`)
        .then((res) => {
          if (cancelled) return;
          setBrands(res.data.data.content);
          setTotalPages(res.data.data.totalPages);
        })
        .catch(console.error)
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [page, search, refreshKey]);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };
  const setField = <K extends keyof BrandForm>(k: K, v: BrandForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (b: BrandResponse) => {
    setEditId(b.id);
    setForm({
      name: b.name,
      logoUrl: b.logoUrl ?? "",
      bannerUrl: b.bannerUrl ?? "",
      description: b.description ?? "",
      country: b.country ?? "",
      website: b.website ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Tên thương hiệu không được trống");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await axiosInstance.put(`/admin/brands/${editId}`, form);
        toast.success("Cập nhật thương hiệu thành công");
      } else {
        await axiosInstance.post("/admin/brands", form);
        toast.success("Tạo thương hiệu thành công");
      }
      setShowModal(false);
      refresh();
    } catch (err: unknown) {
      toast.error("Có lỗi xảy ra");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/brands/${id}`);
      setDeleteId(null);
      toast.success("Đã xóa thương hiệu");
      refresh();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await axiosInstance.patch(`/admin/brands/${id}/toggle-active`);
      setBrands((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)),
      );
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Quản lý thương hiệu
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Thêm, sửa, xóa thương hiệu
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium hover:bg-[#2d2320] transition-colors"
        >
          <Plus size={16} /> Thêm thương hiệu
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          type="text"
          placeholder="Tìm kiếm thương hiệu..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 uppercase tracking-wide bg-stone-50 border-b border-stone-100">
                <th className="text-left px-6 py-3 font-medium">Thương hiệu</th>
                <th className="text-left px-6 py-3 font-medium">Quốc gia</th>
                <th className="text-left px-6 py-3 font-medium">Website</th>
                <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
                <th className="text-right px-6 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : brands.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-stone-400 text-sm"
                  >
                    Không có thương hiệu nào
                  </td>
                </tr>
              ) : (
                brands.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {b.logoUrl ? (
                          <img
                            src={b.logoUrl}
                            alt={b.name}
                            className="w-8 h-8 rounded-lg object-contain border border-stone-100"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold">
                            {b.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-800">{b.name}</p>
                          <p className="text-xs text-stone-400">{b.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {b.country || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {b.website ? (
                        <a
                          href={b.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C4829A] hover:underline text-xs truncate max-w-[160px] block"
                        >
                          {b.website}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          b.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {b.isActive ? "Hoạt động" : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(b.id)}
                          title={b.isActive ? "Ẩn" : "Hiện"}
                          className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                        >
                          {b.isActive ? (
                            <ToggleRight
                              size={15}
                              className="text-emerald-600"
                            />
                          ) : (
                            <ToggleLeft size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(b)}
                          className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(b.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100">
            <p className="text-sm text-stone-500">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-800">
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
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Tên thương hiệu *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
              {/* Logo URL */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  URL Logo
                </label>
                <input
                  value={form.logoUrl}
                  onChange={(e) => setField("logoUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
                {form.logoUrl && (
                  <img
                    src={form.logoUrl}
                    alt="preview"
                    className="mt-2 h-12 object-contain rounded-lg border border-stone-100"
                  />
                )}
              </div>
              {/* Country */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Quốc gia
                </label>
                <input
                  value={form.country}
                  onChange={(e) => setField("country", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
              {/* Website */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Website
                </label>
                <input
                  value={form.website}
                  onChange={(e) => setField("website", e.target.value)}
                  placeholder="https://brand.com"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
              {/* Description */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={3}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#1A1614] text-white text-sm font-medium hover:bg-[#2d2320] disabled:opacity-50 transition-colors"
              >
                {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h3 className="font-semibold text-stone-800">Xác nhận xóa?</h3>
            <p className="text-sm text-stone-500">
              Thương hiệu sẽ bị xóa mềm và không hiển thị trên website.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600"
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
