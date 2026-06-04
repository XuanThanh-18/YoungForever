"use client";

import { useEffect, useState } from "react";
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

interface ProductForm {
  name: string;
  sku: string;
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

  // GIẢI THÍCH: loading=true ngay từ đầu — không cần setLoading(true) trong effect
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

    // CÁCH ĐÚNG: KHÔNG gọi setLoading(true) ở đây.
    // loading=true đã được set từ useState(true) hoặc từ event handler
    // trước khi dependency thay đổi. Chỉ set false sau khi fetch xong.

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

  // Load categories + brands một lần khi mount
  useEffect(() => {
    axiosInstance
      .get<{ data: PageResponse<CategoryResponse> }>("/admin/categories?size=100")
      .then((res) => setCategories(res.data.data.content))
      .catch(console.error);

    axiosInstance
      .get<{ data: PageResponse<BrandResponse> }>("/admin/brands?size=100")
      .then((res) => setBrands(res.data.data.content))
      .catch(console.error);
  }, []);

  // CÁCH ĐÚNG: setLoading(true) gọi từ event handler, không phải trong effect
  const handleSearch = (value: string) => {
    setLoading(true);
    setSearch(value);
    setPage(0);
  };

  const handleFilterCat = (value: string) => {
    setLoading(true);
    setFilterCat(value);
    setPage(0);
  };

  const handleFilterBrand = (value: string) => {
    setLoading(true);
    setFilterBrand(value);
    setPage(0);
  };

  const handleFilterActive = (value: "" | "true" | "false") => {
    setLoading(true);
    setFilterActive(value);
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

  const setField = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = async (p: ProductSummaryResponse) => {
    setEditId(p.id);
    setShowModal(true);
    try {
      const res = await axiosInstance.get<{ data: ProductResponse }>(
        `/admin/products/${p.id}`,
      );
      const d = res.data.data;
      const imgs = d.images ?? [];
      setForm({
        name: d.name,
        sku: d.sku ?? "",
        description: d.description ?? "",
        shortDesc: d.shortDesc ?? "",
        price: String(d.price),
        salePrice: d.salePrice ? String(d.salePrice) : "",
        stock: String(d.stock ?? 0),
        categoryId: d.category?.id ?? "",
        brandId: d.brand?.id ?? "",
        isFeatured: d.isFeatured ?? false,
        isNewArrival: d.isNewArrival ?? false,
        isBestSeller: d.isBestSeller ?? false,
        imageUrl1: imgs[0]?.url ?? "",
        imageUrl2: imgs[1]?.url ?? "",
        imageUrl3: imgs[2]?.url ?? "",
      });
    } catch {
      toast.error("Không thể tải thông tin sản phẩm");
      setShowModal(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Tên sản phẩm không được để trống");
      return;
    }
    if (!form.price || isNaN(parseFloat(form.price))) {
      toast.error("Giá sản phẩm không hợp lệ");
      return;
    }

    setSaving(true);
    const imageUrls = [form.imageUrl1, form.imageUrl2, form.imageUrl3].filter(Boolean);

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim() || undefined,
      description: form.description,
      shortDesc: form.shortDesc,
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
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-stone-400 mt-0.5">{totalItems} sản phẩm</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1A1614] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          <Plus size={16} />
          Thêm sản phẩm
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
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-[#E8A4B8]"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => handleFilterCat(e.target.value)}
          className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-[#E8A4B8]"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterBrand}
          onChange={(e) => handleFilterBrand(e.target.value)}
          className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-[#E8A4B8]"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={(e) => handleFilterActive(e.target.value as "" | "true" | "false")}
          className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-[#E8A4B8]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang bán</option>
          <option value="false">Đã ẩn</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-[#E8A4B8] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            Không có sản phẩm nào
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-stone-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Sản phẩm</th>
                <th className="text-left px-4 py-3 font-medium">Danh mục</th>
                <th className="text-right px-4 py-3 font-medium">Giá</th>
                <th className="text-center px-4 py-3 font-medium">Kho</th>
                <th className="text-center px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        {p.primaryImageUrl ? (
                          <img
                            src={p.primaryImageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-rose-50" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800 line-clamp-1">{p.name}</p>
                        {p.sku && <p className="text-xs text-stone-400">{p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-semibold text-stone-800">{fmtVND(p.effectivePrice)}</p>
                    {p.isOnSale && p.price && (
                      <p className="text-xs text-stone-400 line-through">{fmtVND(p.price)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-medium ${(p.stock ?? 0) < 10 ? "text-red-500" : "text-stone-700"}`}>
                      {p.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(p.id)}
                      className="flex items-center justify-center mx-auto"
                    >
                      {p.isActive ? (
                        <ToggleRight size={24} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={24} className="text-stone-300" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={() => handlePageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-stone-500">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-base font-semibold text-stone-800 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-stone-500 mb-5">
              Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50"
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="text-base font-semibold text-stone-800">
                {editId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Tên sản phẩm *</label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">SKU (mã sản phẩm)</label>
                <input
                  value={form.sku}
                  onChange={(e) => setField("sku", e.target.value)}
                  placeholder="VD: SP001, YF-CREAM-01..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Danh mục</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setField("categoryId", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Thương hiệu</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setField("brandId", e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  >
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Giá gốc *</label>
                  <input
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    type="number"
                    min="0"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Giá sale</label>
                  <input
                    value={form.salePrice}
                    onChange={(e) => setField("salePrice", e.target.value)}
                    type="number"
                    min="0"
                    placeholder="Để trống nếu không có"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Tồn kho</label>
                  <input
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                    type="number"
                    min="0"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Mô tả ngắn</label>
                <textarea
                  value={form.shortDesc}
                  onChange={(e) => setField("shortDesc", e.target.value)}
                  rows={2}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Mô tả chi tiết</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={4}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-500 block">Link ảnh sản phẩm</label>
                {(["imageUrl1", "imageUrl2", "imageUrl3"] as const).map((key, i) => (
                  <input
                    key={key}
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder={`URL ảnh ${i + 1}${i === 0 ? " (ảnh chính)" : ""}`}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                  />
                ))}
              </div>

              <div className="flex gap-4 flex-wrap">
                {(
                  [
                    ["isFeatured", "Nổi bật"],
                    ["isNewArrival", "Hàng mới"],
                    ["isBestSeller", "Bán chạy"],
                  ] as [keyof ProductForm, string][]
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key] as boolean}
                      onChange={(e) => setField(key, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-stone-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-700"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}