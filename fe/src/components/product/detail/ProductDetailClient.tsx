"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Star,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import type { ProductResponse } from "@/types";
import { formatVnd, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import ProductImageGallery from "./ProductImageGallery";
import ProductTabs from "./ProductTabs";
interface Props {
  product: ProductResponse;
}

export default function ProductDetailClient({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { addItem } = useCartStore();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist(product.id);

  const effectivePrice = product.salePrice ?? product.price;
  const isOnSale = !!(product.salePrice && product.salePrice < product.price);
  const discountPercent =
    isOnSale && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  const inStock = (product.stock ?? 0) > 0;
  const rating = Number(product.avgRating ?? 0);
  const reviewCount = product.reviewCount ?? 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-6">
        <Link href="/" className="hover:text-rose-600 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <Link
          href="/products"
          className="hover:text-rose-600 transition-colors"
        >
          Sản phẩm
        </Link>
        {product.category && (
          <>
            <ChevronRight size={12} />
            <Link
              href={`/products?categorySlug=${product.category.slug}`}
              className="hover:text-rose-600 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-stone-600 line-clamp-1">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl border border-stone-100 p-6 lg:p-10 mb-8 shadow-sm">
        {/* Left: Image Gallery */}
        <ProductImageGallery
          images={product.images ?? []}
          productName={product.name}
        />

        {/* Right: Product Info */}
        <div className="flex flex-col gap-5">
          {/* Brand & badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.brand && (
                <Link
                  href={`/brands/${product.brand.slug}`}
                  className="text-xs font-semibold text-rose-600 uppercase tracking-widest hover:underline"
                >
                  {product.brand.name}
                </Link>
              )}
              {product.isNewArrival && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  Mới
                </span>
              )}
              {product.isBestSeller && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Bán chạy
                </span>
              )}
            </div>
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center hover:border-rose-300 hover:text-rose-600 transition-colors text-stone-400"
            >
              <Share2 size={14} />
            </button>
          </div>

          {/* Product name */}
          <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 leading-tight font-serif">
            {product.name}
          </h1>

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.round(rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-stone-200 fill-stone-200"
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-amber-600">
                {rating.toFixed(1)}
              </span>
              <span className="text-sm text-stone-400">
                ({reviewCount} đánh giá)
              </span>
            </div>
          )}

          {/* Short description */}
          {product.shortDesc && (
            <p className="text-sm text-stone-500 leading-relaxed">
              {product.shortDesc}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 py-3 border-y border-stone-100">
            <span className="text-3xl font-bold text-stone-900">
              {formatVnd(effectivePrice)}
            </span>
            {isOnSale && (
              <>
                <span className="text-lg text-stone-400 line-through">
                  {formatVnd(product.price)}
                </span>
                <span className="text-sm font-bold bg-rose-100 text-rose-600 px-2.5 py-1 rounded-full">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                inStock ? "bg-emerald-500" : "bg-stone-300",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                inStock ? "text-emerald-600" : "text-stone-400",
              )}
            >
              {inStock
                ? `Còn hàng${(product.stock ?? 0) <= 10 ? ` (còn ${product.stock} sản phẩm)` : ""}`
                : "Tạm hết hàng"}
            </span>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-stone-700 mb-2">
                Phân loại
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:border-rose-400 hover:text-rose-600 transition-colors"
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-stone-700">Số lượng</p>
            <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 disabled:opacity-40 transition-colors text-stone-600"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-stone-800 border-x border-stone-200">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock ?? 99, q + 1))
                }
                disabled={!inStock || quantity >= (product.stock ?? 99)}
                className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 disabled:opacity-40 transition-colors text-stone-600"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAdding}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all",
                inStock
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-md active:scale-95"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed",
              )}
            >
              <ShoppingBag size={16} />
              {isAdding
                ? "Đang thêm..."
                : inStock
                  ? "Thêm vào giỏ hàng"
                  : "Hết hàng"}
            </button>

            <button
              onClick={() => toggleWishlist()}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-2xl border transition-all active:scale-95",
                isWishlisted
                  ? "border-rose-300 bg-rose-50 text-rose-600"
                  : "border-stone-200 hover:border-rose-300 hover:text-rose-600 text-stone-400",
              )}
            >
              <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: ShieldCheck, label: "Hàng chính hãng" },
              { icon: Truck, label: "Miễn phí vận chuyển" },
              { icon: RotateCcw, label: "Đổi trả 30 ngày" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 p-3 bg-stone-50 rounded-xl text-center"
              >
                <Icon size={16} className="text-rose-500" />
                <span className="text-[10px] text-stone-500 font-medium leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* SKU */}
          {/* {product.sku && (
            <p className="text-xs text-stone-400">
              Mã sản phẩm: <span className="font-mono">{product.sku}</span>
            </p>
          )} */}
        </div>
      </div>

      {/* Tabs: Description, Ingredients, How to use, Reviews */}
      <ProductTabs product={product} />
    </>
  );
}
