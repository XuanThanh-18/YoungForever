"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, Star, Eye, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatVnd } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import type { ProductSummaryResponse } from "@/types";

interface ProductCardProps {
  product: ProductSummaryResponse;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setAddingToCart(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setTimeout(() => setAddingToCart(false), 800);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
  };

  const discount = product.discountPercent ?? 0;
  const isOnSale = product.isOnSale && discount > 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100",
        "hover:shadow-xl hover:shadow-rose-100/50 hover:border-rose-200",
        "transition-all duration-300 ease-out hover:-translate-y-1",
        className,
      )}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20">🌸</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              MỚI
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              HOT
            </span>
          )}
          {isOnSale && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
            "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
            wishlisted
              ? "bg-rose-500 text-white"
              : "bg-white/90 backdrop-blur-sm text-stone-400 hover:text-rose-500 shadow-sm",
          )}
          aria-label="Thêm vào yêu thích"
        >
          <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick view overlay */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-3 flex gap-2",
            "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
            "transition-all duration-300",
          )}
        >
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold",
              "bg-white/95 backdrop-blur-sm text-stone-800 hover:bg-rose-600 hover:text-white",
              "shadow-lg transition-all duration-200",
              addingToCart && "bg-rose-600 text-white",
            )}
          >
            {addingToCart ? (
              <>
                <Zap size={13} className="animate-pulse" />
                Đã thêm!
              </>
            ) : (
              <>
                <ShoppingBag size={13} />
                Thêm vào giỏ
              </>
            )}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/95 backdrop-blur-sm shadow-lg text-stone-500 hover:bg-stone-800 hover:text-white transition-all duration-200"
            aria-label="Xem chi tiết"
          >
            <Eye size={14} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Brand */}
        {product.brand && (
          <span className="text-[10px] text-rose-500 font-semibold tracking-widest uppercase">
            {product.brand.name}
          </span>
        )}

        {/* Name */}
        <p className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2 group-hover:text-rose-700 transition-colors">
          {product.name}
        </p>

        {/* Rating */}
        {product.avgRating !== undefined && product.avgRating > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={10}
                  className={
                    i <= Math.round(product.avgRating ?? 0)
                      ? "text-amber-400 fill-amber-400"
                      : "text-stone-200 fill-stone-200"
                  }
                />
              ))}
            </div>
            {product.reviewCount !== undefined && product.reviewCount > 0 && (
              <span className="text-[10px] text-stone-400">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-rose-600">
            {formatVnd(product.effectivePrice)}
          </span>
          {isOnSale && product.price !== product.effectivePrice && (
            <span className="text-xs text-stone-400 line-through">
              {formatVnd(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
      <div className="aspect-square bg-stone-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 bg-stone-100 rounded-full w-16" />
        <div className="h-3.5 bg-stone-100 rounded-full w-full" />
        <div className="h-3.5 bg-stone-100 rounded-full w-2/3" />
        <div className="h-4 bg-stone-100 rounded-full w-24 mt-1" />
      </div>
    </div>
  );
}
