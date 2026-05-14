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

export default function ProductCard({ product }: Props) {
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist(product.id);

  const effectivePrice = product.salePrice ?? product.price;
  const isOnSale = !!(product.salePrice && product.salePrice < product.price);
  const discountPct =
    isOnSale && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;
  const rating = product.avgRating; // đúng field name từ backend

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addItem(product.id, 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-md hover:border-rose-100 transition-all duration-300">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative overflow-hidden aspect-square bg-stone-50"
      >
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-50 via-pink-50 to-stone-100 flex items-center justify-center">
            <ShoppingBag size={32} className="text-rose-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOnSale && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {product.isNewArrival && !isOnSale && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Mới
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-stone-700 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              Hết hàng
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist();
          }}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-all duration-200",
            "bg-white shadow-sm hover:scale-110",
            isWishlisted
              ? "text-rose-600"
              : "text-stone-400 hover:text-rose-400",
          )}
        >
          <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick add – hover overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={cartLoading || product.stock === 0}
            className={cn(
              "w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
              product.stock === 0
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : "bg-rose-600 text-white hover:bg-rose-700",
            )}
          >
            <ShoppingBag size={13} />
            {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        {product.brand && (
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium mb-1 truncate">
            {product.brand.name}
          </p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-stone-800 hover:text-rose-600 line-clamp-2 transition-colors leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {(product.reviewCount ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={
                    i < Math.round(Number(rating ?? 0))
                      ? "text-amber-400 fill-amber-400"
                      : "text-stone-200 fill-stone-200"
                  }
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-400">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-stone-900">
            {formatVnd(effectivePrice)}
          </span>
          {isOnSale && (
            <span className="text-xs text-stone-400 line-through">
              {formatVnd(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
