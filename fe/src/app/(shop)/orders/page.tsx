"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatVnd, cn } from "@/lib/utils";
import type { OrderResponse, OrderStatus } from "@/types";

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: CheckCircle,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    icon: RefreshCw,
  },
  SHIPPING: {
    label: "Đang giao hàng",
    color: "text-orange-600",
    bg: "bg-orange-50",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao hàng",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-stone-400",
    bg: "bg-stone-50",
    icon: XCircle,
  },
};

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "PROCESSING", label: "Đang xử lý" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
] as const;

// ─── Order card ───────────────────────────────────────────────
function OrderCard({ order }: { order: OrderResponse }) {
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;

  const date = new Date(order.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const previewItems = order.items.slice(0, 3);
  const extraCount = order.items.length - 3;

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="bg-white rounded-2xl border border-stone-100 hover:border-rose-200 hover:shadow-sm transition-all p-5 group">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                status.bg,
              )}
            >
              <StatusIcon size={15} className={status.color} />
            </div>
            <div>
              <p className="text-xs text-stone-400">{date}</p>
              <p className="text-sm font-bold text-stone-800 font-mono">
                #{order.orderNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full",
                status.bg,
                status.color,
              )}
            >
              {status.label}
            </span>
            <ChevronRight
              size={16}
              className="text-stone-300 group-hover:text-rose-400 transition-colors"
            />
          </div>
        </div>

        {/* Product thumbnails */}
        <div className="flex items-center gap-2 mb-4">
          {previewItems.map((item) => (
            <div
              key={item.id}
              className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 border border-stone-100 flex-shrink-0"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
                  <ShoppingBag size={16} className="text-rose-200" />
                </div>
              )}
            </div>
          ))}
          {extraCount > 0 && (
            <div className="w-14 h-14 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-stone-400">
                +{extraCount}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0 ml-1">
            <p className="text-xs text-stone-400 truncate">
              {order.items.map((i) => i.productName).join(", ")}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {order.items.length} sản phẩm
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <p className="text-xs text-stone-400">{order.paymentMethod}</p>
          <div className="text-right">
            <p className="text-xs text-stone-400">Tổng thanh toán</p>
            <p className="text-base font-bold text-rose-600">
              {formatVnd(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login?redirect=/orders");
  }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page],
    queryFn: async () => {
      const { data } = await orderApi.getMyOrders(page, 10);
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const allOrders = data?.content ?? [];
  const filtered =
    activeTab === "ALL"
      ? allOrders
      : allOrders.filter((o) => o.status === activeTab);
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 font-serif flex items-center gap-2">
          <Package size={22} className="text-rose-500" />
          Đơn hàng của tôi
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Theo dõi và quản lý đơn hàng của bạn
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(0);
            }}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
              activeTab === tab.key
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-500 hover:border-rose-300 hover:text-rose-600",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-100 p-5 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-stone-100 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-stone-100 rounded w-20" />
                  <div className="h-3 bg-stone-100 rounded w-32" />
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-14 h-14 bg-stone-100 rounded-xl" />
                ))}
              </div>
              <div className="h-4 bg-stone-100 rounded w-1/3 ml-auto" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={36} strokeWidth={1} className="text-stone-300" />
          </div>
          <p className="text-stone-500 font-medium mb-1">
            Chưa có đơn hàng nào
          </p>
          <p className="text-stone-400 text-sm mb-6">
            {activeTab === "ALL"
              ? "Hãy mua sắm và tạo đơn hàng đầu tiên của bạn!"
              : "Không có đơn hàng nào ở trạng thái này"}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:border-rose-300 hover:text-rose-600 disabled:opacity-40 transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-stone-500">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:border-rose-300 hover:text-rose-600 disabled:opacity-40 transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
