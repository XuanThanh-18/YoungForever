"use client";
// fe/src/app/admin/products/page.tsx  – ENHANCED version
// Changes vs original:
//  - Uses /admin/products (shows ALL including inactive)
//  - Added isActive toggle button
//  - Added category + brand filter selects
//  - Added image upload via /admin/upload (falls back to URL input)
//  - Added validation before save

import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/lib/axios";
import type {
  ProductSummaryResponse,
  CategoryResponse,
  BrandResponse,
  PageResponse,
} from "@/types";
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
  Upload,
  ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Form type ────────────────────────────────────────────────
interface ProductForm {
  name: string;
  description: string;
  shortDesc: string;
  price: string;
  salePrice: string;
  stock: string;
  categoryId: string;
  brandId: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  shortDesc: "",
  price: "",
  salePrice: "",
  stock: "0",
  categoryId: "",
  brandId: "",
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  imageUrl1: "",
  imageUrl2: "",
  imageUrl3: "",
};

const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

// ── ImageUploader ────────────────────────────────────────────
function ImageUploader({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await axiosInstance.post<{ data: string }>(
        "/admin/upload",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      onChange(res.data.data);
      toast.success("Upload thành công");
    } catch {
      toast.error("Upload thất bại, nhập URL thủ công");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-stone-500 block">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... hoặc upload file"
          className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#E8A4B8]"
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="px-3 py-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs flex items-center gap-1 disabled:opacity-50"
        >
          <Upload size={13} />
          {uploading ? "..." : "Upload"}
        </button>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {value && (
        <img
          src={value}
          alt="preview"
          className="h-20 object-cover rounded-xl border border-stone-100 mt-1"
        />
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch products (admin endpoint: all including inactive)
  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);

      const params = new URLSearchParams({ page: String(page), size: "12" });
      if (search) params.set("keyword", search);
      if (filterCat) params.set("categoryId", filterCat);
      if (filterBrand) params.set("brandId", filterBrand);
      if (filterActive !== "") params.set("isActive", filterActive);

      axiosInstance
        .get<{ data: PageResponse<ProductSummaryResponse> }>(
          `/admin/products?${params}`,
        )
        .then((res) => {
          if (cancelled) return;
          setProducts(res.data.data.content);
          setTotalPages(res.data.data.totalPages);
          setTotalItems(res.data.data.totalElements);
        })
        .catch(console.error)
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [page, search, filterCat, filterBrand, filterActive, refreshKey]);

  // Fetch categories + brands once
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      axiosInstance.get<{ data: CategoryResponse[] }>("/categories"),
      axiosInstance.get<{ data: BrandResponse[] }>("/brands"),
    ])
      .then(([cat, br]) => {
        if (cancelled) return;
        setCategories(cat.data.data);
        setBrands(br.data.data);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };
  const setField = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (p: ProductSummaryResponse) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: "",
      shortDesc: "",
      price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : "",
      stock: String(p.stock ?? 0),
      categoryId: p.category?.id ?? "",
      brandId: p.brand?.id ?? "",
      isFeatured: p.isFeatured ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isBestSeller: p.isBestSeller ?? false,
      imageUrl1: p.images?.[0]?.url ?? "",
      imageUrl2: p.images?.[1]?.url ?? "",
      imageUrl3: p.images?.[2]?.url ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Tên sản phẩm không được trống");
      return;
    }
    if (!form.price || isNaN(parseFloat(form.price))) {
      toast.error("Giá không hợp lệ");
      return;
    }

    setSaving(true);
    const imageUrls = [form.imageUrl1, form.imageUrl2, form.imageUrl3].filter(
      Boolean,
    );
    const payload = {
      ...form,
      price: parseFloat(form.price),
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      stock: parseInt(form.stock, 10) || 0,
      categoryId: form.categoryId || undefined,
      brandId: form.brandId || undefined,
      imageUrls,
    };

    try {
      if (editId) {
        await axiosInstance.put(`/admin/products/${editId}`, payload);
        toast.success("Cập nhật thành công");
      } else {
        await axiosInstance.post("/admin/products", payload);
        toast.success("Tạo sản phẩm thành công");
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
      await axiosInstance.delete(`/admin/products/${id}`);
      setDeleteId(null);
      toast.success("Đã xóa sản phẩm");
      refresh();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await axiosInstance.patch(`/admin/products/${id}/toggle-active`);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
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
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {totalItems.toLocaleString("vi-VN")} sản phẩm
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium hover:bg-[#2d2320] transition-colors"
        >
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="Tìm sản phẩm, SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white w-56"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => {
            setFilterCat(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-[#E8A4B8]"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filterBrand}
          onChange={(e) => {
            setFilterBrand(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-[#E8A4B8]"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={(e) => {
            setFilterActive(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-[#E8A4B8]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hiển thị</option>
          <option value="false">Đã ẩn</option>
        </select>
      </div>

      {/* Product grid/table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 uppercase tracking-wide bg-stone-50 border-b border-stone-100">
                <th className="text-left px-6 py-3 font-medium">Sản phẩm</th>
                <th className="text-left px-6 py-3 font-medium">Giá</th>
                <th className="text-left px-6 py-3 font-medium">Tồn kho</th>
                <th className="text-left px-6 py-3 font-medium">Danh mục</th>
                <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
                <th className="text-right px-6 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    Không có sản phẩm
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.primaryImageUrl ? (
                          <img
                            src={p.primaryImageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-stone-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                            <ImageIcon size={16} className="text-stone-300" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-stone-800 line-clamp-1">
                            {p.name}
                          </p>
                          <p className="text-xs text-stone-400">
                            {p.brand?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-800">
                        {fmtVND(p.effectivePrice)}
                      </p>
                      {p.salePrice && (
                        <p className="text-xs text-stone-400 line-through">
                          {fmtVND(p.price)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          (p.stock ?? 0) < 10
                            ? "text-red-600"
                            : "text-stone-700"
                        }`}
                      >
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-xs">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.isActive !== false
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {p.isActive !== false ? "Hiển thị" : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(p.id)}
                          title={
                            p.isActive !== false
                              ? "Ẩn sản phẩm"
                              : "Hiện sản phẩm"
                          }
                          className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                        >
                          {p.isActive !== false ? (
                            <ToggleRight
                              size={15}
                              className="text-emerald-600"
                            />
                          ) : (
                            <ToggleLeft size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-stone-800">
                {editId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
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
                  Tên sản phẩm *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>

              {/* Short desc */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Mô tả ngắn
                </label>
                <textarea
                  value={form.shortDesc}
                  onChange={(e) => setField("shortDesc", e.target.value)}
                  rows={2}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] resize-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={4}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] resize-none"
                />
              </div>

              {/* Price row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Giá gốc (VND) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Giá khuyến mãi
                  </label>
                  <input
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => setField("salePrice", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Tồn kho
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                </div>
              </div>

              {/* Category + Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Danh mục
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setField("categoryId", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white"
                  >
                    <option value="">— Chọn danh mục —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Thương hiệu
                  </label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setField("brandId", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white"
                  >
                    <option value="">— Chọn thương hiệu —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Flags */}
              <div className="flex gap-4">
                {(
                  [
                    ["isFeatured", "Nổi bật"],
                    ["isNewArrival", "Hàng mới"],
                    ["isBestSeller", "Bán chạy"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setField(key, e.target.checked)}
                      className="rounded accent-[#E8A4B8]"
                    />
                    <span className="text-sm text-stone-600">{label}</span>
                  </label>
                ))}
              </div>

              {/* Images */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-stone-500 block">
                  Hình ảnh
                </label>
                <ImageUploader
                  value={form.imageUrl1}
                  onChange={(v) => setField("imageUrl1", v)}
                  label="Ảnh chính"
                />
                <ImageUploader
                  value={form.imageUrl2}
                  onChange={(v) => setField("imageUrl2", v)}
                  label="Ảnh phụ 2"
                />
                <ImageUploader
                  value={form.imageUrl3}
                  onChange={(v) => setField("imageUrl3", v)}
                  label="Ảnh phụ 3"
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

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h3 className="font-semibold text-stone-800">
              Xác nhận xóa sản phẩm?
            </h3>
            <p className="text-sm text-stone-500">
              Sản phẩm sẽ bị xóa mềm và không xuất hiện trên cửa hàng.
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
