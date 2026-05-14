"use client";

import { useState } from "react";
import type { CategoryResponse, BrandResponse } from "@/types";
import { useProducts, useProductFilters } from "@/hooks/useProducts";
import FilterSidebar from "./FilterSidebar";
import SortBar from "./SortBar";
import ProductGrid from "./ProductGrid";
import ProductListItem from "./ProductListItem";
import Pagination from "./Pagination";

interface Props {
  initialCategories: CategoryResponse[];
  initialBrands: BrandResponse[];
}

export default function ProductsClient({
  initialCategories,
  initialBrands,
}: Props) {
  const { filters, setFilters, setPage, resetFilters, hasActiveFilters } =
    useProductFilters();
  const { data, isFetching } = useProducts(filters);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const products = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex gap-8 items-start">
      {/* Sidebar – Desktop (sticky) + Mobile (drawer) */}
      <FilterSidebar
        filters={filters}
        categories={initialCategories}
        brands={initialBrands}
        onFilterChange={setFilters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        mobileOpen={mobileFilterOpen}
        onMobileClose={() => setMobileFilterOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <SortBar
          filters={filters}
          totalElements={totalElements}
          onFilterChange={setFilters}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          view={view}
          onViewChange={setView}
          onMobileFilterOpen={() => setMobileFilterOpen(true)}
        />

        {/* Product list */}
        {isFetching ? (
          /* Skeleton loading */
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-3"
            }
          >
            {Array.from({ length: 12 }).map((_, i) =>
              view === "grid" ? (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-stone-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-stone-100 rounded w-1/3" />
                    <div className="h-4 bg-stone-100 rounded w-4/5" />
                    <div className="h-5 bg-stone-100 rounded w-2/5 mt-3" />
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-stone-100 p-4 flex gap-4 animate-pulse"
                >
                  <div className="w-36 h-36 bg-stone-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-stone-100 rounded w-1/4" />
                    <div className="h-5 bg-stone-100 rounded w-3/4" />
                    <div className="h-4 bg-stone-100 rounded w-1/2" />
                    <div className="h-8 bg-stone-100 rounded w-1/3 mt-4" />
                  </div>
                </div>
              ),
            )}
          </div>
        ) : view === "grid" ? (
          <ProductGrid products={products} totalElements={totalElements} />
        ) : (
          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                <p className="text-base font-medium text-stone-500">
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-sm mt-1">
                  Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            ) : (
              products.map((product, i) => (
                <div
                  key={product.id}
                  className="opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: `${i * 40}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <ProductListItem product={product} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={filters.page ?? 0}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}
