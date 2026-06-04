"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type { CategoryResponse, PageResponse } from "@/types";
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

interface CatForm {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: string;
  sortOrder: string;
}

const EMPTY: CatForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  parentId: "",
  sortOrder: "0",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹẻẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategoriesPage() {
  const [cats, setCats]             = useState<CategoryResponse[]>([]);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // loading=true từ đầu
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState<CatForm>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // KHÔNG gọi setLoading(true) ở đây
    const params = new URLSearchParams({ page: String(page), size: "15" });
    if (search) params.set("keyword", search);

    axiosInstance
      .get<{ data: PageResponse<CategoryResponse> }>(`/admin/categories?${params}`)
      .then((res) => {
        if (cancelled) return;
        setCats(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, search, refreshKey]);

  // setLoading(true) từ event handler
  const handleSearch = (value: string) => {
    setLoading(true);
    setSearch(value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setPage(newPage);
  };

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const setField = <K extends keyof CatForm>(k: K, v: CatForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

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
      imageUrl: c.imageUrl ?? "",
      parentId: c.parent?.id ?? "",
      sortOrder: String((c as unknown as { sortOrder?: number }).sortOrder ?? 0),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Tên không được trống"); return; }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      imageUrl: form.imageUrl,
      parentId: form.parentId || null,
      sortOrder: parseInt(form.sortOrder) || 0,
    };
    try {
      if (editId) {
        await axiosInstance.put(`/admin/categories/${editId}`, payload);
        toast.success("Cập nhật thành công");
      } else {
        await axiosInstance.post("/admin/categories", payload);
        toast.success("Tạo danh mục thành công");
      }
      setShowModal(false);
      refresh();
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/categories/${id}`);
      setDeleteId(null);
      toast.success("Đã xóa danh mục");
      refresh();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await axiosInstance.patch(`/admin/categories/${id}/toggle-active`);
      setCats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
      );
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const rootCats = cats.filter((c) => !c.parent);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Quản lý danh mục</h1>
          <p className="text-sm text-stone-500 mt-1">Thêm, sửa, xóa danh mục sản phẩm</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium hover:bg-[#2d2320] transition-colors"
        >
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 uppercase tracking-wide bg-stone-50 border-b border-stone-100">
                <th className="text-left px-6 py-3 font-medium">Tên danh mục</th>
                <th className="text-left px-6 py-3 font-medium">Slug</th>
                <th className="text-left px-6 py-3 font-medium">Danh mục cha</th>
                <th className="text-left px-6 py-3 font-medium">Thứ tự</th>
                <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
                <th className="text-right px-6 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400 text-sm">
                    Không có danh mục nào
                  </td>
                </tr>
              ) : (
                cats.map((c) => (
                  <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {c.imageUrl && (
                          <img src={c.imageUrl} alt={c.name} className="w-7 h-7 rounded-lg object-cover" />
                        )}
                        <span className="font-medium text-stone-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-400 font-mono text-xs">{c.slug}</td>
                    <td className="px-6 py-4 text-stone-500">{c.parent?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-stone-500">
                      {(c as unknown as { sortOrder?: number }).sortOrder ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.isActive !== false
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-stone-100 text-stone-500"
                      }`}>
                        {c.isActive !== false ? "Hoạt động" : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(c.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                        >
                          {c.isActive !== false ? (
                            <ToggleRight size={15} className="text-emerald-600" />
                          ) : (
                            <ToggleLeft size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100">
            <p className="text-sm text-stone-500">Trang {page + 1} / {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-base font-semibold text-stone-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-stone-500 mb-5">Danh mục sẽ bị xóa. Tiếp tục?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium"
              >Huỷ</button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium"
              >Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal create/edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white">
              <h2 className="font-semibold text-stone-800">
                {editId ? "Cập nhật danh mục" : "Thêm danh mục mới"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-stone-100">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Tên danh mục *</label>
                <input
                  value={form.name}
                  onChange={(e) => {
                    setField("name", e.target.value);
                    if (!editId) setField("slug", slugify(e.target.value));
                  }}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Danh mục cha</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setField("parentId", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                >
                  <option value="">-- Không có --</option>
                  {rootCats
                    .filter((c) => c.id !== editId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">URL ảnh</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setField("imageUrl", e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={3}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Thứ tự hiển thị</label>
                <input
                  value={form.sortOrder}
                  onChange={(e) => setField("sortOrder", e.target.value)}
                  type="number"
                  min="0"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium"
              >Huỷ</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium disabled:opacity-50"
              >{saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo mới"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}