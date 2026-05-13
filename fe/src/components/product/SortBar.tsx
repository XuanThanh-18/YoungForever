"use client";

import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import type { ProductFilters } from "@/hooks/useProducts";
import { formatVnd, cn } from "@/lib/utils";

interface Props {
  filters: ProductFilters;
  totalElements: number;
  onFilterChange: (f: Partial<ProductFilters>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  onMobileFilterOpen: () => void;
}

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Mới nhất" },
  { value: "soldCount:desc", label: "Bán chạy" },
  { value: "avgRating:desc", label: "Đánh giá cao" },
  { value: "price:asc", label: "Giá tăng dần" },
  { value: "price:desc", label: "Giá giảm dần" },
];

const SKIN_TYPE_LABELS: Record<string, string> = {
  dry: "Da khô",
  oily: "Da dầu",
  combo: "Da hỗn hợp",
  sensitive: "Da nhạy cảm",
  normal: "Da thường",
};

export default function SortBar({
  filters,
  totalElements,
  onFilterChange,
  onReset,
  hasActiveFilters,
  view,
  onViewChange,
  onMobileFilterOpen,
}: Props) {
  const currentSort = `${filters.sortBy ?? "createdAt"}:${filters.sortDir ?? "desc"}`;

  // Build active filter tags
  const activeTags: { key: string; label: string; remove: () => void }[] = [];

  if (filters.keyword)
    activeTags.push({
      key: "keyword",
      label: `"${filters.keyword}"`,
      remove: () => onFilterChange({ keyword: undefined }),
    });

  if (filters.skinType)
    activeTags.push({
      key: "skinType",
      label: SKIN_TYPE_LABELS[filters.skinType] ?? filters.skinType,
      remove: () => onFilterChange({ skinType: undefined }),
    });

  if (filters.minRating)
    activeTags.push({
      key: "minRating",
      label: `≥ ${filters.minRating}★`,
      remove: () => onFilterChange({ minRating: undefined }),
    });

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const label = [
      filters.minPrice ? formatVnd(filters.minPrice) : null,
      filters.maxPrice ? formatVnd(filters.maxPrice) : null,
    ]
      .filter(Boolean)
      .join(" – ");
    activeTags.push({
      key: "price",
      label,
      remove: () =>
        onFilterChange({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (filters.isNewArrival)
    activeTags.push({
      key: "isNewArrival",
      label: "Hàng mới",
      remove: () => onFilterChange({ isNewArrival: undefined }),
    });
  if (filters.isBestSeller)
    activeTags.push({
      key: "isBestSeller",
      label: "Bán chạy",
      remove: () => onFilterChange({ isBestSeller: undefined }),
    });
  if (filters.isFeatured)
    activeTags.push({
      key: "isFeatured",
      label: "Nổi bật",
      remove: () => onFilterChange({ isFeatured: undefined }),
    });
  if (filters.inStock)
    activeTags.push({
      key: "inStock",
      label: "Còn hàng",
      remove: () => onFilterChange({ inStock: undefined }),
    });

  return (
    <div className="space-y-3 mb-5">
      {/* Top row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Mobile filter button */}
        <button
          onClick={onMobileFilterOpen}
          className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-700 hover:border-rose-300 transition-colors"
        >
          <SlidersHorizontal size={14} />
          Bộ lọc
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeTags.length}
            </span>
          )}
        </button>

        {/* Result count */}
        <p className="text-sm text-stone-500 flex-1 min-w-0">
          <span className="font-semibold text-stone-800">
            {totalElements.toLocaleString("vi-VN")}
          </span>{" "}
          sản phẩm
        </p>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split(":");
              onFilterChange({ sortBy, sortDir });
            }}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-stone-200 rounded-xl text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 hover:border-rose-300 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
        </div>

        {/* View toggle */}
        <div className="hidden sm:flex items-center border border-stone-200 rounded-xl overflow-hidden">
          <button
            onClick={() => onViewChange("grid")}
            className={cn(
              "p-2 transition-colors",
              view === "grid"
                ? "bg-rose-600 text-white"
                : "text-stone-400 hover:bg-stone-50",
            )}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={cn(
              "p-2 transition-colors",
              view === "list"
                ? "bg-rose-600 text-white"
                : "text-stone-400 hover:bg-stone-50",
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Active filter tags */}
      {activeTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeTags.map((tag) => (
            <button
              key={tag.key}
              onClick={tag.remove}
              className="flex items-center gap-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full hover:bg-rose-100 transition-colors"
            >
              {tag.label}
              <X size={11} />
            </button>
          ))}
          <button
            onClick={onReset}
            className="text-xs text-stone-400 hover:text-rose-600 underline underline-offset-2 transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
