"use client";

import Link from "next/link";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatVnd } from "@/lib/utils";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, isLoading } =
    useCartStore();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl
          flex flex-col transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-rose-600" />
            <h2 className="text-base font-semibold text-stone-800">
              Giỏ hàng
              {(cart?.totalItems ?? 0) > 0 && (
                <span className="ml-2 text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-normal">
                  {cart?.totalItems} sản phẩm
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-stone-400 gap-3">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="text-sm">Giỏ hàng của bạn đang trống</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="text-xs text-rose-600 underline underline-offset-2"
              >
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-100" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productSlug}`}
                    onClick={closeCart}
                    className="text-sm font-medium text-stone-800 hover:text-rose-600 line-clamp-2 leading-tight"
                  >
                    {item.productName}
                  </Link>
                  {item.variantName && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {item.variantName}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-rose-600 mt-1">
                    {formatVnd(item.unitPrice)}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateItem(item.id, item.quantity - 1)
                            : removeItem(item.id)
                        }
                        disabled={isLoading}
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-50"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm text-stone-700 font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={
                          isLoading || item.quantity >= item.availableStock
                        }
                        className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-50 disabled:opacity-50"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-700">
                    {formatVnd(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-stone-100 px-5 py-4 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Tạm tính</span>
              <span className="font-semibold text-stone-800">
                {formatVnd(cart.totalPrice)}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Phí vận chuyển và mã giảm giá sẽ được tính ở bước thanh toán
            </p>

            {/* CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold text-center py-3 rounded-xl transition-colors"
            >
              Tiến hành thanh toán
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full text-center text-sm text-stone-500 hover:text-stone-700 py-1"
            >
              Xem giỏ hàng
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
