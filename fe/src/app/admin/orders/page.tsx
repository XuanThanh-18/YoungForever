"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type { OrderResponse, PageResponse } from "@/types";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────
type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle2,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "bg-indigo-100 text-indigo-700",
    icon: RefreshCw,
  },
  SHIPPED: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-600",
    icon: XCircle,
  },
  REFUNDED: {
    label: "Hoàn tiền",
    color: "bg-stone-100 text-stone-600",
    icon: RefreshCw,
  },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
};

const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const fmtDate = (s: string) =>
  new Date(s).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });

// ── Component ────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);

      const params = new URLSearchParams({ page: String(page), size: "15" });
      if (search) params.set("keyword", search);
      if (statusFilter) params.set("status", statusFilter);

      axiosInstance
        .get<{ data: PageResponse<OrderResponse> }>(`/admin/orders?${params}`)
        .then((res) => {
          if (cancelled) return;
          setOrders(res.data.data.content);
          setTotalPages(res.data.data.totalPages);
          setTotalItems(res.data.data.totalElements);
        })
        .catch(console.error)
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [page, search, statusFilter, refreshKey]);

  const refresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await axiosInstance.put(
        `/admin/orders/${orderId}/status?status=${status}`,
      );
      toast.success("Cập nhật trạng thái thành công");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Quản lý đơn hàng</h1>
        <p className="text-sm text-stone-500 mt-1">
          Tổng {totalItems.toLocaleString("vi-VN")} đơn hàng
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="Mã đơn, tên khách, SĐT..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white w-72"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OrderStatus | "");
            setPage(0);
          }}
          className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 uppercase tracking-wide bg-stone-50 border-b border-stone-100">
                <th className="text-left px-6 py-3 font-medium">Mã đơn</th>
                <th className="text-left px-6 py-3 font-medium">Khách hàng</th>
                <th className="text-left px-6 py-3 font-medium">Tổng tiền</th>
                <th className="text-left px-6 py-3 font-medium">Thanh toán</th>
                <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-6 py-3 font-medium">Thời gian</th>
                <th className="text-left px-6 py-3 font-medium">Hành động</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-stone-400 text-sm"
                  >
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status as OrderStatus];
                  const StatusIcon = cfg?.icon ?? Package;
                  const nextStatuses =
                    NEXT_STATUS[order.status as OrderStatus] ?? [];
                  const isExpanded = expandedId === order.id;

                  return (
                    <>
                      <tr
                        key={order.id}
                        className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-stone-500">
                          #
                          {(order.orderNumber ?? order.id)
                            .slice(0, 10)
                            .toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-stone-700">
                            {order.shippingName ?? "—"}
                          </p>
                          <p className="text-xs text-stone-400">
                            {order.shippingPhone ?? ""}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-stone-800">
                          {fmtVND(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-stone-500 text-xs capitalize">
                          {order.paymentMethod?.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                              cfg?.color,
                            )}
                          >
                            <StatusIcon size={11} />
                            {cfg?.label ?? order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-400 text-xs">
                          {fmtDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          {nextStatuses.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {nextStatuses.map((s) => (
                                <button
                                  key={s}
                                  onClick={() =>
                                    handleStatusUpdate(order.id, s)
                                  }
                                  disabled={updatingId === order.id}
                                  className={cn(
                                    "text-xs px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50",
                                    s === "CANCELLED"
                                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                                      : "bg-[#1A1614]/5 text-[#1A1614] hover:bg-[#1A1614]/10",
                                  )}
                                >
                                  {STATUS_CONFIG[s]?.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : order.id)
                            }
                            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                          >
                            <ChevronDown
                              size={14}
                              className={cn(
                                "transition-transform",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded row: order items */}
                      {isExpanded && (
                        <tr
                          key={`${order.id}-detail`}
                          className="bg-stone-50/50"
                        >
                          <td colSpan={8} className="px-6 py-4">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                                Sản phẩm trong đơn
                              </p>
                              {order.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3"
                                >
                                  {item.imageUrl && (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.productName}
                                      className="w-10 h-10 rounded-lg object-cover border border-stone-100"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-stone-700">
                                      {item.productName}
                                    </p>
                                    {item.variantName && (
                                      <p className="text-xs text-stone-400">
                                        {item.variantName}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-xs text-stone-500">
                                    x{item.quantity}
                                  </span>
                                  <span className="text-sm font-semibold text-stone-700 w-28 text-right">
                                    {fmtVND(item.totalPrice)}
                                  </span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-stone-100 flex justify-between text-sm">
                                <span className="text-stone-500">
                                  Địa chỉ giao: {order.shippingAddress ?? "—"}
                                </span>
                                <span className="font-semibold text-stone-800">
                                  Tổng: {fmtVND(order.totalAmount)}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100">
            <p className="text-sm text-stone-500">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
