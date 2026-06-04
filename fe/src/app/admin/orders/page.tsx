"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type { OrderResponse, PageResponse, OrderStatus } from "@/types";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
  RefreshCw,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Status config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-amber-50 text-amber-700",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "bg-blue-50 text-blue-700",
    icon: CheckCircle2,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "bg-indigo-50 text-indigo-700",
    icon: Package,
  },
  SHIPPING: {
    label: "Đang giao",
    color: "bg-cyan-50 text-cyan-700",
    icon: Truck,
  },
  DELIVERED: {
    label: "Đã giao",
    color: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Đã huỷ",
    color: "bg-red-50 text-red-700",
    icon: XCircle,
  },
  REFUNDED: {
    label: "Hoàn tiền",
    color: "bg-stone-50 text-stone-700",
    icon: RefreshCw,
  },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["REFUNDED"],
};

const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

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

  // GIẢI THÍCH: loading=true ngay từ đầu — component mount là cần fetch ngay,
  // không cần setLoading(true) trong effect nữa.
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // CÁCH ĐÚNG: KHÔNG gọi setLoading(true) ở đây.
    // loading=true đã được set bởi:
    //   - useState(true) khi lần đầu mount
    //   - handleSearch/handleStatusChange/refresh() trước khi thay đổi dependency
    // Chỉ set loading=false trong callback sau khi fetch xong.

    const params = new URLSearchParams({ page: String(page), size: "20" });
    if (search.trim()) params.set("keyword", search.trim());
    if (statusFilter) params.set("status", statusFilter);

    axiosInstance
      .get<{ data: PageResponse<OrderResponse> }>(`/admin/orders?${params}`)
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalItems(res.data.data.totalElements);
      })
      .catch(() => {
        if (!cancelled) toast.error("Không thể tải danh sách đơn hàng");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search, statusFilter, refreshKey]);

  // CÁCH ĐÚNG: setLoading(true) được gọi từ event handler (onClick, onChange)
  // — không phải từ trong effect. Event handler là nơi hợp lệ để gọi setState.
  const handleSearch = (value: string) => {
    setLoading(true);
    setSearch(value);
    setPage(0);
  };

  const handleStatusFilter = (value: OrderStatus | "") => {
    setLoading(true);
    setStatusFilter(value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setPage(newPage);
  };

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
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-[#E8A4B8]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            handleStatusFilter(e.target.value as OrderStatus | "")
          }
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
            <div className="w-6 h-6 border-2 border-[#E8A4B8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
                const Icon = cfg?.icon ?? Circle;
                const isExpanded = expandedId === order.id;
                const nextStatuses = NEXT_STATUS[order.status] ?? [];

                return (
                  <>
                    <tr
                      key={order.id}
                      className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : order.id)
                      }
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronUp size={13} className="text-stone-400" />
                          ) : (
                            <ChevronDown size={13} className="text-stone-400" />
                          )}
                          <span className="font-mono text-xs font-semibold text-stone-700">
                            #{order.orderNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-stone-700">
                          {order.shippingName ?? order.shipFullName ?? "—"}
                        </p>
                        <p className="text-xs text-stone-400">
                          {order.shippingPhone ?? order.shipPhone ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg?.color ?? "bg-stone-50 text-stone-600"}`}
                        >
                          <Icon size={11} />
                          {cfg?.label ?? order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-stone-800">
                        {fmtVND(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-xs">
                        {fmtDate(order.createdAt)}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {nextStatuses.length > 0 && (
                          <select
                            disabled={updatingId === order.id}
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value)
                                handleUpdateStatus(
                                  order.id,
                                  e.target.value as OrderStatus,
                                );
                              e.target.value = "";
                            }}
                            className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#E8A4B8] disabled:opacity-50"
                          >
                            <option value="">Cập nhật...</option>
                            {nextStatuses.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_CONFIG[s].label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${order.id}-detail`} className="bg-stone-50/80">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-stone-500 mb-2">
                              Sản phẩm trong đơn:
                            </p>
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-stone-700">
                                  {item.productName}
                                  {item.variantName && (
                                    <span className="text-stone-400 ml-1">
                                      ({item.variantName})
                                    </span>
                                  )}
                                </span>
                                <span className="text-stone-500">
                                  x{item.quantity} ·{" "}
                                  <span className="font-semibold text-stone-800">
                                    {fmtVND(item.totalPrice)}
                                  </span>
                                </span>
                              </div>
                            ))}
                            {order.shipAddress && (
                              <p className="text-xs text-stone-400 pt-2 ...">
                                📍 {order.shippingAddress ?? order.shipAddress}
                              </p>
                            )}
                            {order.customerNote && (
                              <p className="text-xs text-stone-400">
                                📝 {order.customerNote}
                              </p>
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
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={() => handlePageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:border-rose-300 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-stone-500">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:border-rose-300 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
