"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  Loader2,
  Copy,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatVnd, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import toast from "react-hot-toast";

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: CheckCircle,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    icon: RefreshCw,
  },
  SHIPPING: {
    label: "Đang giao hàng",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao hàng",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "text-stone-400",
    bg: "bg-stone-50 border-stone-200",
    icon: XCircle,
  },
};

// ─── Order timeline ───────────────────────────────────────────
const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Đặt hàng" },
  { status: "CONFIRMED", label: "Xác nhận" },
  { status: "PROCESSING", label: "Đóng gói" },
  { status: "SHIPPING", label: "Vận chuyển" },
  { status: "DELIVERED", label: "Đã giao" },
];

const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "DELIVERED",
];

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
        <XCircle size={20} className="text-stone-400" />
        <p className="text-sm font-medium text-stone-500">Đơn hàng đã bị hủy</p>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <div
            key={step.status}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  done
                    ? "bg-rose-600 border-rose-600"
                    : "bg-white border-stone-200",
                  active && "ring-4 ring-rose-100",
                )}
              >
                {done ? (
                  <CheckCircle size={14} className="text-white" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-stone-200" />
                )}
              </div>
              <p
                className={cn(
                  "text-[10px] font-medium text-center whitespace-nowrap",
                  done ? "text-rose-600" : "text-stone-400",
                )}
              >
                {step.label}
              </p>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1 mb-5 rounded-full",
                  i < currentIndex ? "bg-rose-500" : "bg-stone-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Payment method labels ─────────────────────────────────────
const PAYMENT_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPAY: "VNPay",
  MOMO: "MoMo",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

// ─── Main page ────────────────────────────────────────────────
export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", params.id],
    queryFn: async () => {
      const { data } = await orderApi.getById(params.id);
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancel(params.id),
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["order", params.id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("Không thể hủy đơn hàng"),
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!");
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex justify-center">
        <Loader2 size={32} className="animate-spin text-rose-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={40} className="text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500">Không tìm thấy đơn hàng</p>
        <Link
          href="/orders"
          className="text-sm text-rose-600 hover:underline mt-2 inline-block"
        >
          Về danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";

  const date = new Date(order.createdAt).toLocaleString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-500 hover:border-rose-300 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-stone-900 font-mono">
              #{order.orderNumber}
            </h1>
            <button
              onClick={() => handleCopy(order.orderNumber)}
              className="text-stone-300 hover:text-rose-500 transition-colors"
            >
              <Copy size={13} />
            </button>
            <span
              className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full border",
                status.bg,
                status.color,
              )}
            >
              <StatusIcon size={11} className="inline mr-1" />
              {status.label}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{date}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-stone-700 mb-5">
            Trạng thái đơn hàng
          </h2>
          <OrderTimeline status={order.status} />
        </div>

        {/* Product list */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <Package size={15} className="text-rose-500" />
            Sản phẩm đã đặt ({order.items.length})
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0 border border-stone-100">
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 line-clamp-1">
                    {item.productName}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {item.variantName}
                    </p>
                  )}
                  <p className="text-xs text-stone-500 mt-0.5">
                    {formatVnd(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold text-stone-900 flex-shrink-0">
                  {formatVnd(item.totalPrice)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
            <div className="flex justify-between text-sm text-stone-500">
              <span>Tạm tính</span>
              <span>{formatVnd(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-500">
              <span>Phí vận chuyển</span>
              <span>
                {order.shippingFee === 0 ? (
                  <span className="text-emerald-600">Miễn phí</span>
                ) : (
                  formatVnd(order.shippingFee)
                )}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-rose-500">
                <span>
                  Giảm giá{order.couponCode ? ` (${order.couponCode})` : ""}
                </span>
                <span>−{formatVnd(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100">
              <span>Tổng cộng</span>
              <span className="text-rose-600 text-lg">
                {formatVnd(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <MapPin size={15} className="text-rose-500" />
            Thông tin giao hàng
          </h2>
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-stone-800">{order.shipFullName}</p>
            <p className="text-stone-500">{order.shipPhone}</p>
            <p className="text-stone-500">{order.shipAddress}</p>
          </div>
          {order.customerNote && (
            <div className="mt-3 p-3 bg-stone-50 rounded-xl">
              <p className="text-xs text-stone-400 mb-1 font-medium">Ghi chú</p>
              <p className="text-sm text-stone-600">{order.customerNote}</p>
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
            <CreditCard size={15} className="text-rose-500" />
            Phương thức thanh toán
          </h2>
          <p className="text-sm text-stone-600">
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/orders"
            className="flex-1 py-3 text-center border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
          >
            Đơn hàng khác
          </Link>
          {canCancel && (
            <button
              onClick={() => {
                if (confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
              className="flex-1 py-3 text-center border border-red-200 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors text-sm disabled:opacity-50"
            >
              {cancelMutation.isPending ? (
                <Loader2 size={14} className="animate-spin mx-auto" />
              ) : (
                "Hủy đơn hàng"
              )}
            </button>
          )}
          {order.status === "DELIVERED" && (
            <Link
              href="/products"
              className="flex-1 py-3 text-center bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Mua lại
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
