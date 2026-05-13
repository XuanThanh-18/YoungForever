"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { ProductSummaryResponse } from "@/types";
import { formatVnd, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlist } from "@/hooks/useWishlist";

interface Props {
  product: ProductSummaryResponse;
}

export default function ProductListItem({ product }: Props) {
  const { addItem, isLoading } = useCartStore();
  const { isWishlisted, toggle } = useWishlist(product.id);

  const effectivePrice = product.salePrice ?? product.originalPrice;

  return (
    <div className="group bg-white rounded-2xl border border-stone-100 hover:border-rose-100 hover:shadow-sm transition-all duration-300 flex gap-4 p-3 sm:p-4">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0"
      >
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-100" />
        )}
        {product.isOnSale && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            -{product.discountPercent}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1">
          {product.brand && (
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium mb-1">
              {product.brand.name}
            </p>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-semibold text-stone-800 hover:text-rose-600 line-clamp-2 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Category */}
          {product.category && (
            <p className="text-xs text-stone-400 mt-1">
              {product.category.name}
            </p>
          )}

          {/* Rating */}
          {(product.reviewCount ?? 0) > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={
                      i < Math.round(product.averageRating ?? 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-stone-200 fill-stone-200"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-stone-500">
                ({product.reviewCount})
              </span>
            </div>
          )}
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between mt-3 gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-rose-600">
              {formatVnd(effectivePrice)}
            </span>
            {product.isOnSale && (
              <span className="text-xs text-stone-400 line-through">
                {formatVnd(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className={cn(
                "w-8 h-8 rounded-xl border flex items-center justify-center transition-colors",
                isWishlisted
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-stone-200 text-stone-400 hover:border-rose-200 hover:text-rose-400",
              )}
            >
              <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
            {product.stock > 0 && (
              <button
                onClick={() => addItem(product.id, 1)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                <ShoppingBag size={12} />
                <span className="hidden sm:inline">Thêm vào giỏ</span>
                <span className="sm:hidden">Thêm</span>
              </button>
            )}
            {product.stock === 0 && (
              <span className="px-3 py-2 text-xs text-stone-400 border border-stone-200 rounded-xl">
                Hết hàng
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
