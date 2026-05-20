"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type {
  ProductSummaryResponse,
  CategoryResponse,
  BrandResponse,
  PageResponse,
} from "@/types";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Image from "next/image";

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
}
const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  shortDesc: "",
  price: "",
  salePrice: "",
  stock: "",
  categoryId: "",
  brandId: "",
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
};

function fmt(v: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(v ?? 0);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ✅ Fetch products — inline với đủ dependencies
  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({ page: String(page), size: "12" });
    if (search) params.set("keyword", search);

    axiosInstance
      .get<{ data: PageResponse<ProductSummaryResponse> }>(
        `/products?${params}`,
      )
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search, refreshKey]);

  const refreshProducts = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const setPageWithLoading = (nextPage: number) => {
    setLoading(true);
    setPage(nextPage);
  };

  // ✅ Fetch categories + brands một lần, cũng inline
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      axiosInstance.get<{ data: CategoryResponse[] }>("/categories"),
      axiosInstance.get<{ data: BrandResponse[] }>("/brands"),
    ])
      .then(([catRes, brandRes]) => {
        if (cancelled) return;
        setCategories(catRes.data.data);
        setBrands(brandRes.data.data);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

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
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        stock: parseInt(form.stock, 10),
        categoryId: form.categoryId || undefined,
        brandId: form.brandId || undefined,
      };
      if (editId) {
        await axiosInstance.put(`/products/${editId}`, payload);
      } else {
        await axiosInstance.post("/products", payload);
      }
      setShowModal(false);
      refreshProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      setDeleteId(null);
      refreshProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const setField = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-stone-500 mt-1">Thêm, sửa, xóa sản phẩm</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium hover:bg-[#2d2320] transition-colors"
        >
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => {
            setLoading(true);
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 animate-pulse"
              >
                <div className="h-44 bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-100 rounded" />
                  <div className="h-3 bg-stone-100 rounded w-2/3" />
                </div>
              </div>
            ))
          : products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 group hover:shadow-md transition-shadow"
              >
                <div className="relative h-44 bg-stone-50">
                  {p.primaryImageUrl ? (
                    <Image
                      src={p.primaryImageUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-stone-300 text-sm">
                      No image
                    </div>
                  )}
                  {p.isOnSale && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{p.discountPercent}%
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 bg-white rounded-lg shadow text-stone-600 hover:text-blue-600"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="p-1.5 bg-white rounded-lg shadow text-stone-600 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug">
                    {p.name}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">{p.brand?.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-800">
                      {fmt(p.effectivePrice)}
                    </span>
                    {p.salePrice && (
                      <span className="text-xs text-stone-400 line-through">
                        {fmt(p.price)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Tồn kho: {p.stock ?? 0}
                  </p>
                </div>
              </div>
            ))}
        {!loading && products.length === 0 && (
          <div className="col-span-4 py-16 text-center text-stone-400 text-sm">
            Không tìm thấy sản phẩm nào
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPageWithLoading(page - 1)}
            disabled={page === 0}
            className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm text-stone-500">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPageWithLoading(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-lg text-stone-800">
                {editId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-stone-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Tên sản phẩm *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Mô tả ngắn
                </label>
                <input
                  value={form.shortDesc}
                  onChange={(e) => setField("shortDesc", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Mô tả chi tiết
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8A4B8] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">
                  Giá gốc *
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
                  Giá sale
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
              <div className="col-span-2 flex gap-6">
                {(["isFeatured", "isNewArrival", "isBestSeller"] as const).map(
                  (flag) => (
                    <label
                      key={flag}
                      className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form[flag]}
                        onChange={(e) => setField(flag, e.target.checked)}
                        className="w-4 h-4 rounded accent-[#C4829A]"
                      />
                      {
                        {
                          isFeatured: "Nổi bật",
                          isNewArrival: "Hàng mới",
                          isBestSeller: "Bán chạy",
                        }[flag]
                      }
                    </label>
                  ),
                )}
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
                disabled={saving || !form.name || !form.price}
                className="flex-1 py-2.5 rounded-xl bg-[#1A1614] text-white text-sm font-medium disabled:opacity-50 hover:bg-[#2d2320] transition-colors"
              >
                {saving ? "Đang lưu..." : editId ? "Cập nhật" : "Tạo sản phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-stone-800 mb-2">Xóa sản phẩm?</h3>
            <p className="text-sm text-stone-500 mb-6">
              Hành động này không thể hoàn tác (soft delete).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50"
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
