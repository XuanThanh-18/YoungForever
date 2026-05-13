"use client";

import type { ProductSummaryResponse } from "@/types";
import ProductCard from "./ProductCard";
import { PackageSearch } from "lucide-react";

interface Props {
  products: ProductSummaryResponse[];
  isLoading?: boolean;
  totalElements?: number;
}

/** Skeleton card */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-stone-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-stone-100 rounded w-1/3" />
        <div className="h-4 bg-stone-100 rounded w-4/5" />
        <div className="h-4 bg-stone-100 rounded w-3/5" />
        <div className="h-5 bg-stone-100 rounded w-2/5 mt-3" />
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  isLoading,
  totalElements,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-400">
        <PackageSearch
          size={56}
          strokeWidth={1}
          className="mb-4 text-stone-300"
        />
        <p className="text-base font-medium text-stone-500">
          Không tìm thấy sản phẩm nào
        </p>
        <p className="text-sm text-stone-400 mt-1">
          Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="opacity-0 animate-fadeIn"
          style={{
            animationDelay: `${i * 40}ms`,
            animationFillMode: "forwards",
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
