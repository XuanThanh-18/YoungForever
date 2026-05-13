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
  const price = product.salePrice ?? product.price;
  const originalPrice = product.price;
  const isOnSale = !!(product.salePrice && product.salePrice < product.price);
  const discountPct =
    isOnSale && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;
  const rating = product.avgRating; // backend field name
  const hasDiscount = product.isOnSale && product.salePrice;

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
          {hasDiscount && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{product.discountPercent}%
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

        {/* Quick add */}
        {product.stock > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product.id, 1);
            }}
            disabled={cartLoading}
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-rose-600 text-white text-xs font-semibold py-2.5",
              "flex items-center justify-center gap-1.5",
              "translate-y-full group-hover:translate-y-0 transition-transform duration-300",
              "disabled:opacity-70",
            )}
          >
            <ShoppingBag size={13} />
            Thêm vào giỏ
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="p-3">
        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium mb-1">
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-stone-800 hover:text-rose-600 line-clamp-2 leading-snug transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {(product.reviewCount ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] text-stone-500">
              {product.averageRating?.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold text-rose-600">
            {formatVnd(product.salePrice ?? product.originalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-stone-400 line-through">
              {formatVnd(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
