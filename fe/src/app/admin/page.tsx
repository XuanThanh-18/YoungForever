"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import type { OrderResponse, PageResponse } from "@/types";

interface DashboardStats {
  revenueToday: number;
  revenueThisMonth: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredToday: number;
  cancelledToday: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã huỷ",
  RETURNED: "Hoàn hàng",
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

function fmt(v: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(v ?? 0);
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={18} />
        </div>
        <ArrowUpRight size={14} className="text-stone-300" />
      </div>
      <p className="text-2xl font-bold text-stone-800 mb-1">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch inline — không dùng useCallback với setState
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      axiosInstance.get<{ data: DashboardStats }>("/admin/dashboard"),
      axiosInstance.get<{ data: PageResponse<OrderResponse> }>(
        "/admin/orders?page=0&size=8",
      ),
    ])
      .then(([statsRes, ordersRes]) => {
        if (cancelled) return;
        setStats(statsRes.data.data);
        setRecentOrders(ordersRes.data.data.content);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Doanh thu hôm nay",
      value: fmt(stats?.revenueToday ?? 0),
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
      sub: `Tháng này: ${fmt(stats?.revenueThisMonth ?? 0)}`,
    },
    {
      label: "Đơn chờ xử lý",
      value: String(stats?.pendingOrders ?? 0),
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      sub: `Đang xử lý: ${stats?.processingOrders ?? 0}`,
    },
    {
      label: "Đã giao hôm nay",
      value: String(stats?.deliveredToday ?? 0),
      icon: CheckCircle2,
      color: "bg-blue-50 text-blue-600",
      sub: `Huỷ hôm nay: ${stats?.cancelledToday ?? 0}`,
    },
    {
      label: "Tổng khách hàng",
      value: String(stats?.totalUsers ?? 0),
      icon: Users,
      color: "bg-pink-50 text-pink-600",
      sub: `Sản phẩm: ${stats?.totalProducts ?? 0}`,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">
          Tổng quan hoạt động hôm nay
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">Đơn hàng gần đây</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-[#C4829A] hover:underline flex items-center gap-1"
          >
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 uppercase tracking-wide border-b border-stone-50">
                <th className="text-left px-6 py-3 font-medium">Mã đơn</th>
                <th className="text-left px-6 py-3 font-medium">Khách hàng</th>
                <th className="text-left px-6 py-3 font-medium">Tổng tiền</th>
                <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-6 py-3 font-medium">Thời gian</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="px-6 py-3.5 font-mono text-xs text-stone-500">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-stone-700">
                    {order.shippingName ?? "—"}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-stone-800">
                    {fmt(order.totalAmount)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[order.status] ?? "bg-stone-100 text-stone-600"}`}
                    >
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-stone-400">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[#C4829A] hover:underline text-xs"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-stone-400"
                  >
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
