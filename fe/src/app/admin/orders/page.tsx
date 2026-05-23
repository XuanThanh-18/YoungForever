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
// FIX BUG 8: dùng "SHIPPING" khớp với backend enum OrderStatus
type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPING" // ← FIX: was "SHIPPED"
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
  SHIPPING: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  }, // ← FIX
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
  PROCESSING: ["SHIPPING", "CANCELLED"], // ← FIX: was SHIPPED
  SHIPPING: ["DELIVERED"], // ← FIX: was SHIPPED
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

  // FIX BUG 11: truyền keyword + status cùng lúc thay vì 2 nhánh riêng
  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), size: "20" });
    if (search.trim()) params.set("keyword", search.trim());
    if (statusFilter) params.set("status", statusFilter);

    axiosInstance
      .get<{ data: PageResponse<OrderResponse> }>(`/admin/orders?${params}`)
      .then((res) => {
        setOrders(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalItems(res.data.data.totalElements);
      })
      .catch(() => toast.error("Không thể tải danh sách đơn hàng"))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, refreshKey]);

  const refresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    setUpdatingId(orderId);
    try {
      await axiosInstance.put(`/admin/orders/${orderId}/status`, null, {
        params: { status: newStatus },
      });
      toast.success("Đã cập nhật trạng thái");
      refresh();
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">
            Quản lý đơn hàng
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">{totalItems} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setLoading(true);
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-[#E8A4B8]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setLoading(true);
            setStatusFilter(e.target.value as OrderStatus | "");
            setPage(0);
          }}
          className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-[#E8A4B8]"
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
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            Đang tải...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-sm">
            Không có đơn hàng nào
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-stone-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Mã đơn</th>
                <th className="text-left px-4 py-3 font-medium">Khách hàng</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium">Tổng tiền</th>
                <th className="text-left px-4 py-3 font-medium">Ngày đặt</th>
                <th className="px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status as OrderStatus];
                const Icon = cfg?.icon ?? Package;
                const nextStatuses =
                  NEXT_STATUS[order.status as OrderStatus] ?? [];
                const isExpanded = expandedId === order.id;

                return (
                  <>
                    <tr
                      key={order.id}
                      className="border-b border-stone-50 hover:bg-stone-50 cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : order.id)
                      }
                    >
                      <td className="px-4 py-3 font-mono text-xs text-stone-600">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-800">
                          {order.shipFullName}
                        </div>
                        <div className="text-stone-400 text-xs">
                          {order.shipPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {cfg && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                              cfg.color,
                            )}
                          >
                            <Icon size={11} />
                            {cfg.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-stone-800">
                        {fmtVND(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs">
                        {fmtDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {nextStatuses.map((ns) => (
                            <button
                              key={ns}
                              disabled={updatingId === order.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(order.id, ns);
                              }}
                              className="px-2 py-1 text-xs rounded-lg bg-stone-100 hover:bg-[#E8A4B8] hover:text-white transition-colors disabled:opacity-50"
                            >
                              → {STATUS_CONFIG[ns]?.label}
                            </button>
                          ))}
                          <ChevronDown
                            size={14}
                            className={cn(
                              "text-stone-400 transition-transform",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row: order items */}
                    {isExpanded && (
                      <tr key={`${order.id}-detail`} className="bg-stone-50">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="text-xs text-stone-500 font-medium mb-2">
                            Chi tiết đơn hàng – {order.items.length} sản phẩm
                          </div>
                          <div className="space-y-1.5">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 bg-white rounded-lg p-2.5"
                              >
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-stone-700 text-xs truncate">
                                    {item.productName}
                                  </div>
                                  {item.variantName && (
                                    <div className="text-stone-400 text-xs">
                                      {item.variantName}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-stone-500">
                                  x{item.quantity}
                                </div>
                                <div className="text-xs font-medium text-stone-800">
                                  {fmtVND(item.totalPrice)}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-stone-500 space-y-0.5">
                            {order.shipAddress && (
                              <div>📍 {order.shipAddress}</div>
                            )}
                            {order.couponCode && (
                              <div>
                                🏷️ Mã giảm giá: {order.couponCode} (−
                                {fmtVND(order.discountAmount)})
                              </div>
                            )}
                            {order.customerNote && (
                              <div>📝 Ghi chú: {order.customerNote}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-stone-500">
          <span>
            Trang {page + 1} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => {
                setLoading(true);
                setPage((p) => p - 1);
              }}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => {
                setLoading(true);
                setPage((p) => p + 1);
              }}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
