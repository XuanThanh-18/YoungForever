"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { formatVnd, cn } from "@/lib/utils";
import type { ProductSummaryResponse } from "@/types";
import toast from "react-hot-toast";

function WishlistCard({ product }: { product: ProductSummaryResponse }) {
  const queryClient = useQueryClient();
  const { addItem, isLoading: cartLoading } = useCartStore();

  const removeMutation = useMutation({
    mutationFn: () => wishlistApi.toggle(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Đã xóa khỏi danh sách yêu thích");
    },
  });

  const effectivePrice = product.salePrice ?? product.price;
  const isOnSale = !!(product.salePrice && product.salePrice < product.price);
  const discountPct =
    isOnSale && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;
  const inStock = (product.stock ?? 1) > 0;

  return (
    <div className="group bg-white rounded-2xl border border-stone-100 hover:border-rose-100 hover:shadow-sm transition-all overflow-hidden">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-stone-50"
      >
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
            <ShoppingBag size={32} className="text-rose-200" />
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200">
              Hết hàng
            </span>
          </div>
        )}
        {/* Remove from wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            removeMutation.mutate();
          }}
          disabled={removeMutation.isPending}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center shadow-sm transition-colors opacity-0 group-hover:opacity-100"
        >
          <Heart size={14} className="text-rose-500 fill-rose-500" />
        </button>
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

        <div className="flex items-baseline gap-2 mt-2 mb-3">
          <span className="text-base font-bold text-stone-900">
            {formatVnd(effectivePrice)}
          </span>
          {isOnSale && (
            <span className="text-xs text-stone-400 line-through">
              {formatVnd(product.price)}
            </span>
          )}
        </div>

        <button
          onClick={() => addItem(product.id, 1)}
          disabled={cartLoading || !inStock}
          className={cn(
            "w-full py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5",
            inStock
              ? "bg-rose-600 hover:bg-rose-700 text-white"
              : "bg-stone-100 text-stone-400 cursor-not-allowed",
          )}
        >
          <ShoppingBag size={13} />
          {inStock ? "Thêm vào giỏ hàng" : "Hết hàng"}
        </button>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login?redirect=/wishlist");
  }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await wishlistApi.get(0, 50);
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const products = data?.content ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
            <Heart size={18} className="text-rose-600 fill-rose-100" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 font-serif">
              Yêu thích
            </h1>
            {!isLoading && (
              <p className="text-sm text-stone-400">
                {products.length} sản phẩm
              </p>
            )}
          </div>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Tiếp tục mua sắm
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-stone-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-stone-100 rounded w-1/3" />
                <div className="h-4 bg-stone-100 rounded w-4/5" />
                <div className="h-5 bg-stone-100 rounded w-2/5" />
                <div className="h-8 bg-stone-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-24">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={40} strokeWidth={1.5} className="text-rose-200" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 font-serif mb-2">
            Danh sách yêu thích trống
          </h2>
          <p className="text-stone-400 text-sm mb-8 max-w-sm mx-auto">
            Nhấn vào biểu tượng trái tim trên các sản phẩm bạn thích để lưu lại
            nhé!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl transition-colors text-sm"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      )}

      {/* Grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="opacity-0 animate-fadeIn"
              style={{
                animationDelay: `${i * 40}ms`,
                animationFillMode: "forwards",
              }}
            >
              <WishlistCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
