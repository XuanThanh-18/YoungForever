"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Star,
  X,
  SlidersHorizontal,
} from "lucide-react";
import type { CategoryResponse, BrandResponse } from "@/types";
import type { ProductFilters } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

interface Props {
  filters: ProductFilters;
  categories: CategoryResponse[];
  brands: BrandResponse[];
  onFilterChange: (f: Partial<ProductFilters>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  /** Mobile: show/hide state */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 last:border-0 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-stone-700 hover:text-stone-900 mb-0"
      >
        {title}
        {open ? (
          <ChevronUp size={15} className="text-stone-400" />
        ) : (
          <ChevronDown size={15} className="text-stone-400" />
        )}
      </button>
      {open && <div className="mt-3 space-y-1">{children}</div>}
    </div>
  );
}

const PRICE_RANGES = [
  { label: "Dưới 200.000đ", min: undefined, max: 200000 },
  { label: "200.000 – 500.000đ", min: 200000, max: 500000 },
  { label: "500.000 – 1.000.000đ", min: 500000, max: 1000000 },
  { label: "1.000.000 – 2.000.000đ", min: 1000000, max: 2000000 },
  { label: "Trên 2.000.000đ", min: 2000000, max: undefined },
];

const SKIN_TYPES = [
  { value: "dry", label: "Da khô" },
  { value: "oily", label: "Da dầu" },
  { value: "combo", label: "Da hỗn hợp" },
  { value: "sensitive", label: "Da nhạy cảm" },
  { value: "normal", label: "Da thường" },
];

export default function FilterSidebar({
  filters,
  categories,
  brands,
  onFilterChange,
  onReset,
  hasActiveFilters,
  mobileOpen,
  onMobileClose,
}: Props) {
  const isPriceRangeActive = (min?: number, max?: number) =>
    filters.minPrice === min && filters.maxPrice === max;

  const content = (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-rose-500" />
          <span className="font-semibold text-stone-800 text-sm">Bộ lọc</span>
          {hasActiveFilters && (
            <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Đang lọc
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
          >
            <X size={12} /> Xóa tất cả
          </button>
        )}
      </div>

      {/* Danh mục */}
      <Section title="Danh mục">
        <button
          onClick={() => onFilterChange({ categoryId: undefined })}
          className={cn(
            "w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors",
            !filters.categoryId
              ? "bg-rose-50 text-rose-700 font-medium"
              : "text-stone-600 hover:bg-stone-50",
          )}
        >
          Tất cả danh mục
        </button>
        {categories.map((cat) => (
          <div key={cat.id}>
            <button
              onClick={() => onFilterChange({ categoryId: cat.id })}
              className={cn(
                "w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors",
                filters.categoryId === cat.id
                  ? "bg-rose-50 text-rose-700 font-medium"
                  : "text-stone-600 hover:bg-stone-50",
              )}
            >
              {cat.name}
            </button>
            {/* Sub-categories */}
            {cat.children?.map((sub) => (
              <button
                key={sub.id}
                onClick={() => onFilterChange({ categoryId: sub.id })}
                className={cn(
                  "w-full text-left text-sm px-2 py-1.5 pl-6 rounded-lg transition-colors",
                  filters.categoryId === sub.id
                    ? "bg-rose-50 text-rose-700 font-medium"
                    : "text-stone-500 hover:bg-stone-50",
                )}
              >
                └ {sub.name}
              </button>
            ))}
          </div>
        ))}
      </Section>

      {/* Thương hiệu */}
      <Section title="Thương hiệu">
        <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
          <button
            onClick={() => onFilterChange({ brandId: undefined })}
            className={cn(
              "w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors",
              !filters.brandId
                ? "bg-rose-50 text-rose-700 font-medium"
                : "text-stone-600 hover:bg-stone-50",
            )}
          >
            Tất cả thương hiệu
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onFilterChange({ brandId: brand.id })}
              className={cn(
                "w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2",
                filters.brandId === brand.id
                  ? "bg-rose-50 text-rose-700 font-medium"
                  : "text-stone-600 hover:bg-stone-50",
              )}
            >
              {brand.logoUrl && (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-5 h-5 object-contain rounded"
                />
              )}
              {brand.name}
            </button>
          ))}
        </div>
      </Section>

      {/* Khoảng giá */}
      <Section title="Khoảng giá">
        {PRICE_RANGES.map((range) => (
          <button
            key={range.label}
            onClick={() =>
              isPriceRangeActive(range.min, range.max)
                ? onFilterChange({ minPrice: undefined, maxPrice: undefined })
                : onFilterChange({ minPrice: range.min, maxPrice: range.max })
            }
            className={cn(
              "w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2",
              isPriceRangeActive(range.min, range.max)
                ? "bg-rose-50 text-rose-700 font-medium"
                : "text-stone-600 hover:bg-stone-50",
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center",
                isPriceRangeActive(range.min, range.max)
                  ? "border-rose-500 bg-rose-500"
                  : "border-stone-300",
              )}
            >
              {isPriceRangeActive(range.min, range.max) && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </span>
            {range.label}
          </button>
        ))}

        {/* Nhập giá tùy chỉnh */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
          <input
            type="number"
            placeholder="Từ"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onFilterChange({
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-2 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-300"
          />
          <span className="text-stone-400 text-xs flex-shrink-0">–</span>
          <input
            type="number"
            placeholder="Đến"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onFilterChange({
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full px-2 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-300"
          />
        </div>
      </Section>

      {/* Đánh giá */}
      <Section title="Đánh giá tối thiểu">
        {[5, 4, 3].map((rating) => (
          <button
            key={rating}
            onClick={() =>
              filters.minRating === rating
                ? onFilterChange({ minRating: undefined })
                : onFilterChange({ minRating: rating })
            }
            className={cn(
              "w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2",
              filters.minRating === rating
                ? "bg-rose-50 text-rose-700 font-medium"
                : "text-stone-600 hover:bg-stone-50",
            )}
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-stone-200 fill-stone-200"
                  }
                />
              ))}
            </div>
            <span>trở lên</span>
          </button>
        ))}
      </Section>

      {/* Loại da */}
      <Section title="Loại da">
        <div className="flex flex-wrap gap-1.5">
          {SKIN_TYPES.map((st) => (
            <button
              key={st.value}
              onClick={() =>
                filters.skinType === st.value
                  ? onFilterChange({ skinType: undefined })
                  : onFilterChange({ skinType: st.value })
              }
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors",
                filters.skinType === st.value
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white text-stone-600 border-stone-200 hover:border-rose-300",
              )}
            >
              {st.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Loại sản phẩm */}
      <Section title="Phân loại">
        {(
          [
            { key: "isNewArrival", label: "✨ Hàng mới về" },
            { key: "isBestSeller", label: "🔥 Bán chạy nhất" },
            { key: "isFeatured", label: "⭐ Nổi bật" },
            { key: "inStock", label: "📦 Còn hàng" },
          ] as const
        ).map(({ key, label }) => {
          const active = filters[key] as boolean | undefined;
          const nextFilters: Partial<ProductFilters> = {
            [key]: active ? undefined : true,
          };

          return (
            <button
              key={key}
              onClick={() => onFilterChange(nextFilters)}
              className={cn(
                "w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2",
                active
                  ? "bg-rose-50 text-rose-700 font-medium"
                  : "text-stone-600 hover:bg-stone-50",
              )}
            >
              <span
                className={cn(
                  "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors",
                  active ? "border-rose-500 bg-rose-500" : "border-stone-300",
                )}
              >
                {active && (
                  <span className="text-white text-[10px] font-bold">✓</span>
                )}
              </span>
              {label}
            </button>
          );
        })}
      </Section>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="sticky top-20 bg-white rounded-2xl border border-stone-100 p-4">
          {content}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen !== undefined && (
        <>
          {mobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={onMobileClose}
            />
          )}
          <aside
            className={cn(
              "fixed left-0 top-0 z-50 h-full w-80 bg-white shadow-2xl overflow-y-auto",
              "transition-transform duration-300 ease-out lg:hidden",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="p-5 pt-16">
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600"
              >
                <X size={20} />
              </button>
              {content}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
