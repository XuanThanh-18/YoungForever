"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type { OrderResponse, PageResponse } from "@/types";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const ALL_STATUSES = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã huỷ" },
  { value: "RETURNED", label: "Hoàn hàng" },
];

const NEXT_STATUS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED", "RETURNED"],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: [],
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPING: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-orange-100 text-orange-700",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã huỷ",
  RETURNED: "Hoàn hàng",
};

function fmt(v: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(v ?? 0);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ✅ Fetch inline — page, statusFilter, refreshKey là dependencies thực sự
  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({ page: String(page), size: "15" });
    if (statusFilter) params.set("status", statusFilter);

    axiosInstance
      .get<{ data: PageResponse<OrderResponse> }>(`/admin/orders?${params}`)
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, refreshKey]);

  const refreshOrders = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await axiosInstance.put(
        `/admin/orders/${orderId}/status?status=${newStatus}`,
      );
      refreshOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Quản lý đơn hàng
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Xem và cập nhật trạng thái đơn hàng
          </p>
        </div>
        <button
          onClick={refreshOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setStatusFilter(s.value);
              setPage(0);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === s.value
                ? "bg-[#1A1614] text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 uppercase tracking-wide bg-stone-50 border-b border-stone-100">
                <th className="text-left px-6 py-3 font-medium">Mã đơn</th>
                <th className="text-left px-6 py-3 font-medium">Khách hàng</th>
                <th className="text-left px-6 py-3 font-medium">SĐT</th>
                <th className="text-left px-6 py-3 font-medium">Tổng tiền</th>
                <th className="text-left px-6 py-3 font-medium">Thanh toán</th>
                <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-6 py-3 font-medium">Ngày đặt</th>
                <th className="text-left px-6 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-stone-50">
                      {[...Array(8)].map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-stone-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map((order) => {
                    const nextStatuses = NEXT_STATUS[order.status] ?? [];
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-stone-500">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-medium text-stone-700">
                          {order.shippingName ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-stone-500">
                          {order.shippingPhone ?? "—"}
                        </td>
                        <td className="px-6 py-4 font-semibold text-stone-800">
                          {fmt(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-xs text-stone-500">
                          {order.paymentMethod}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.status] ?? "bg-stone-100 text-stone-600"}`}
                          >
                            {STATUS_LABEL[order.status] ?? order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {nextStatuses.length > 0 ? (
                            <div className="flex gap-1 flex-wrap">
                              {nextStatuses.map((ns) => (
                                <button
                                  key={ns}
                                  disabled={updatingId === order.id}
                                  onClick={() =>
                                    handleStatusChange(order.id, ns)
                                  }
                                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                                    ns === "CANCELLED" || ns === "RETURNED"
                                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                                      : "bg-[#E8A4B8]/20 text-[#C4829A] hover:bg-[#E8A4B8]/40"
                                  }`}
                                >
                                  {STATUS_LABEL[ns]}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-stone-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-stone-400"
                  >
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
