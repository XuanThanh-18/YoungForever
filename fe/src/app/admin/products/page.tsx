"use client";
// FIX BUG 7: openEdit() phải gọi GET /admin/products/:id để lấy đầy đủ description
// FIX BUG 10: thêm trường SKU vào form

import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/lib/axios";
import type {
  ProductSummaryResponse,
  ProductResponse,
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
} from "lucide-react";
import toast from "react-hot-toast";

// ── Form type ────────────────────────────────────────────────
interface ProductForm {
  name: string;
  sku: string; // FIX BUG 10: thêm trường SKU
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
  sku: "",
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

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

    return () => {
      cancelled = true;
    };
  }, [page, search, filterCat, filterBrand, filterActive, refreshKey]);

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

  // FIX BUG 7: gọi API để lấy đầy đủ chi tiết sản phẩm (bao gồm description)
  // Trước đó chỉ dùng dữ liệu từ ProductSummaryResponse → mất description
  const openEdit = async (p: ProductSummaryResponse) => {
    setEditId(p.id);
    setForm(EMPTY_FORM); // reset trước
    setShowModal(true);

    try {
      // Gọi endpoint chi tiết theo slug để lấy đầy đủ fields
      const res = await axiosInstance.get<{ data: ProductResponse }>(
        `/products/${p.slug}`,
      );
      const full = res.data.data;
      setForm({
        name: full.name,
        sku: full.sku ?? "",
        description: full.description ?? "",
        shortDesc: full.shortDesc ?? "",
        price: String(full.price),
        salePrice: full.salePrice ? String(full.salePrice) : "",
        stock: String(full.stock ?? 0),
        categoryId: full.category?.id ?? "",
        brandId: full.brand?.id ?? "",
        isFeatured: full.isFeatured ?? false,
        isNewArrival: full.isNewArrival ?? false,
        isBestSeller: full.isBestSeller ?? false,
        imageUrl1: full.images?.[0]?.url ?? "",
        imageUrl2: full.images?.[1]?.url ?? "",
        imageUrl3: full.images?.[2]?.url ?? "",
      });
    } catch {
      toast.error("Không thể tải chi tiết sản phẩm");
      setShowModal(false);
    }
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
      name: form.name.trim(),
      sku: form.sku.trim() || undefined, // FIX BUG 10
      description: form.description || undefined,
      shortDesc: form.shortDesc || undefined,
      price: parseFloat(form.price),
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      stock: parseInt(form.stock, 10) || 0,
      categoryId: form.categoryId || undefined,
      brandId: form.brandId || undefined,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      isBestSeller: form.isBestSeller,
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
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Có lỗi xảy ra";
      toast.error(msg);
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
      toast.success("Đã cập nhật");
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">{totalItems} sản phẩm</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#E8A4B8] text-white rounded-xl text-sm hover:bg-[#d490a4] transition-colors"
        >
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setLoading(true);
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm tên, SKU..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-[#E8A4B8]"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => {
            setLoading(true);
            setFilterCat(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
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
            setLoading(true);
            setFilterBrand(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
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
            setLoading(true);
            setFilterActive(e.target.value as "" | "true" | "false");
            setPage(0);
          }}
          className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang bán</option>
          <option value="false">Ẩn</option>
        </select>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-400 text-sm">
          Đang tải...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">
          Không có sản phẩm nào
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border transition-all ${
                p.isActive
                  ? "border-stone-100"
                  : "border-dashed border-stone-200 opacity-60"
              }`}
            >
              <div className="aspect-square rounded-t-2xl overflow-hidden bg-stone-50">
                {p.primaryImageUrl ? (
                  <img
                    src={p.primaryImageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-stone-800 line-clamp-2 mb-1">
                  {p.name}
                </div>
                {p.sku && (
                  <div className="text-xs text-stone-400 mb-1">
                    SKU: {p.sku}
                  </div>
                )}
                <div className="text-sm font-semibold text-[#E8A4B8]">
                  {fmtVND(p.effectivePrice)}
                </div>
                <div className="text-xs text-stone-400">
                  Kho: {p.stock ?? 0}
                </div>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
                  >
                    <Pencil size={11} /> Sửa
                  </button>
                  <button
                    onClick={() => handleToggleActive(p.id)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
                    title={p.isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                  >
                    {p.isActive ? (
                      <ToggleRight size={14} className="text-green-600" />
                    ) : (
                      <ToggleLeft size={14} className="text-stone-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm text-stone-500">
          <span>
            Trang {page + 1} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => {
                setLoading(true);
                setPage((p) => p - 1);
              }}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => {
                setLoading(true);
                setPage((p) => p + 1);
              }}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal tạo / sửa sản phẩm */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-stone-800 text-sm">
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

              {/* SKU – FIX BUG 10 */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  SKU (mã sản phẩm)
                </label>
                <input
                  value={form.sku}
                  onChange={(e) => setField("sku", e.target.value)}
                  placeholder="VD: SP001, YF-CREAM-01..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>

              {/* Category + Brand */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Danh mục
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setField("categoryId", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  >
                    <option value="">-- Chọn danh mục --</option>
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
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  >
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price + Sale price */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Giá bán *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Giá khuyến mãi
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.salePrice}
                    onChange={(e) => setField("salePrice", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Tồn kho
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                </div>
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

              {/* Image URLs */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-500 block">
                  Link ảnh sản phẩm
                </label>
                {(["imageUrl1", "imageUrl2", "imageUrl3"] as const).map(
                  (key, i) => (
                    <input
                      key={key}
                      value={form[key]}
                      onChange={(e) => setField(key, e.target.value)}
                      placeholder={`URL ảnh ${i + 1}${i === 0 ? " (ảnh chính)" : ""}`}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                    />
                  ),
                )}
              </div>

              {/* Flags */}
              <div className="flex gap-4 flex-wrap">
                {(
                  [
                    ["isFeatured", "Nổi bật"],
                    ["isNewArrival", "Hàng mới"],
                    ["isBestSeller", "Bán chạy"],
                  ] as [keyof ProductForm, string][]
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={(e) => setField(key, e.target.checked)}
                      className="rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-stone-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 text-sm bg-[#E8A4B8] text-white rounded-xl hover:bg-[#d490a4] transition-colors disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo sản phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-stone-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-stone-500 mb-5">
              Sản phẩm sẽ bị ẩn khỏi cửa hàng (soft delete). Bạn có chắc chắn?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 text-sm border border-stone-200 rounded-xl hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600"
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
