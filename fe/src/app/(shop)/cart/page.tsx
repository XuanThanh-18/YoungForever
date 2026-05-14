"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  X,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { couponApi } from "@/lib/api";
import { formatVnd, cn } from "@/lib/utils";
import type { CouponResponse, CartItemResponse } from "@/types";
import toast from "react-hot-toast";

const FREE_SHIP_THRESHOLD = 500_000;
const SHIP_FEE = 30_000;

// ─── Cart Item Row ────────────────────────────────────────────
function CartItemRow({
  item,
  onUpdate,
  onRemove,
  isLoading,
}: {
  item: CartItemResponse;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  isLoading: boolean;
}) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(item.id);
    setRemoving(false);
  };

  return (
    <div
      className={cn(
        "flex gap-4 py-5 border-b border-stone-100 last:border-0 transition-opacity",
        removing && "opacity-40 pointer-events-none",
      )}
    >
      {/* Image */}
      <Link
        href={`/products/${item.productSlug}`}
        className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-50 hover:opacity-90 transition-opacity"
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
            <ShoppingBag size={20} className="text-rose-200" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.productSlug}`}>
            <h3 className="text-sm font-semibold text-stone-800 hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
              {item.productName}
            </h3>
          </Link>
          {item.variantName && (
            <p className="text-xs text-stone-400 mt-0.5">{item.variantName}</p>
          )}
          <p className="text-sm font-medium text-rose-600 mt-1">
            {formatVnd(item.unitPrice)}
          </p>
        </div>

        {/* Quantity + Remove */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Qty stepper */}
          <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
            <button
              onClick={() =>
                item.quantity > 1
                  ? onUpdate(item.id, item.quantity - 1)
                  : handleRemove()
              }
              disabled={isLoading}
              className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              <Minus size={13} />
            </button>
            <span className="w-10 h-9 flex items-center justify-center text-sm font-semibold text-stone-800 border-x border-stone-200">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              disabled={isLoading || item.quantity >= item.availableStock}
              className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Subtotal */}
          <p className="text-sm font-bold text-stone-900 w-24 text-right hidden sm:block">
            {formatVnd(item.totalPrice)}
          </p>

          {/* Remove */}
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const { cart, fetchCart, updateItem, removeItem, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponResponse | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/cart");
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  if (!cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-rose-400" />
      </div>
    );
  }

  const items = cart.items ?? [];
  const subtotal = cart.totalPrice;
  const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FEE;
  const discount = coupon?.calculatedDiscount ?? 0;
  const total = subtotal + shipping - discount;
  const remaining = FREE_SHIP_THRESHOLD - subtotal;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const { data } = await couponApi.apply(couponInput.trim(), subtotal);
      setCoupon(data.data);
      toast.success(`Tiết kiệm ${formatVnd(data.data.calculatedDiscount)}!`);
    } catch {
      toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput("");
  };

  // ── Empty state ──────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag
              size={40}
              strokeWidth={1.5}
              className="text-rose-300"
            />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 font-serif mb-2">
            Giỏ hàng trống
          </h1>
          <p className="text-stone-500 text-sm mb-8">
            Hãy khám phá các sản phẩm mỹ phẩm cao cấp và thêm vào giỏ hàng của
            bạn.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif">
            Giỏ hàng
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {cart.totalItems} sản phẩm
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft size={15} />
          Tiếp tục mua sắm
        </Link>
      </div>

      {/* Free shipping progress */}
      {remaining > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3.5 mb-6 flex items-center gap-3">
          <Truck size={18} className="text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-700">
              Thêm <span className="font-bold">{formatVnd(remaining)}</span> để
              được <span className="font-bold">miễn phí vận chuyển</span>
            </p>
            <div className="mt-1.5 h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* ── Left: Cart items ──────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5 sm:p-6">
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] text-xs font-semibold text-stone-400 uppercase tracking-wider pb-3 border-b border-stone-100 mb-1">
            <span>Sản phẩm</span>
            <span className="text-center w-28">Số lượng</span>
            <span className="text-right w-24">Thành tiền</span>
            <span className="w-8" />
          </div>

          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onRemove={removeItem}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* ── Right: Order summary ──────────────────────────── */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5">
            <h3 className="flex items-center gap-2 font-semibold text-stone-800 mb-3 text-sm">
              <Tag size={15} className="text-rose-500" />
              Mã giảm giá
            </h3>

            {coupon ? (
              <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-rose-600">
                    {coupon.code}
                  </p>
                  <p className="text-xs text-rose-400 mt-0.5">
                    {coupon.description ??
                      `Giảm ${formatVnd(coupon.calculatedDiscount)}`}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="w-6 h-6 flex items-center justify-center text-rose-400 hover:text-rose-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-stone-300"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  {applyingCoupon ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Áp dụng"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5">
            <h3 className="font-semibold text-stone-800 mb-4">
              Tóm tắt đơn hàng
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Tạm tính ({cart.totalItems} sản phẩm)</span>
                <span>{formatVnd(subtotal)}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Phí vận chuyển</span>
                <span
                  className={
                    shipping === 0 ? "text-emerald-600 font-medium" : ""
                  }
                >
                  {shipping === 0 ? "Miễn phí" : formatVnd(shipping)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Giảm giá</span>
                  <span>−{formatVnd(discount)}</span>
                </div>
              )}

              <hr className="border-stone-100" />

              <div className="flex justify-between items-baseline font-bold text-stone-900">
                <span className="text-base">Tổng cộng</span>
                <span className="text-xl text-rose-600">
                  {formatVnd(total)}
                </span>
              </div>

              <p className="text-[11px] text-stone-400">
                Đã bao gồm VAT (nếu có)
              </p>
            </div>

            <Link
              href="/checkout"
              className="mt-5 flex items-center justify-center gap-2 w-full py-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold rounded-2xl transition-all text-sm shadow-sm"
            >
              Tiến hành đặt hàng
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-5">
            <div className="space-y-3">
              {[
                {
                  icon: ShieldCheck,
                  text: "Hàng chính hãng 100% – Cam kết hoàn tiền",
                },
                {
                  icon: Truck,
                  text: "Miễn phí vận chuyển cho đơn từ 500.000đ",
                },
                {
                  icon: RotateCcw,
                  text: "Đổi trả miễn phí trong vòng 30 ngày",
                },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon
                    size={15}
                    className="text-rose-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
