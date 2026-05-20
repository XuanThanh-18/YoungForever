"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type { UserResponse, PageResponse } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ✅ Fetch inline với page là dependency thực sự
  useEffect(() => {
    let cancelled = false;

    axiosInstance
      .get<{ data: PageResponse<UserResponse> }>(
        `/admin/users?page=${page}&size=15`,
      )
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const setPageWithLoading = (nextPage: number) => {
    setLoading(true);
    setPage(nextPage);
  };

  const handleToggle = async (userId: string) => {
    setTogglingId(userId);
    try {
      await axiosInstance.put(`/admin/users/${userId}/toggle-active`);
      // Optimistic update — không cần refetch
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: !u.isActive } : u,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">
          Quản lý khách hàng
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Xem thông tin và kích hoạt / khóa tài khoản
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 uppercase tracking-wide bg-stone-50 border-b border-stone-100">
                <th className="text-left px-6 py-3 font-medium">Họ tên</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">SĐT</th>
                <th className="text-left px-6 py-3 font-medium">Role</th>
                <th className="text-left px-6 py-3 font-medium">Xác thực</th>
                <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-6 py-3 font-medium">Ngày tạo</th>
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
                : users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-stone-50 hover:bg-stone-50/50"
                    >
                      <td className="px-6 py-4 font-medium text-stone-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E8A4B8]/30 flex items-center justify-center text-[#C4829A] text-sm font-semibold shrink-0">
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          {u.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-500">{u.email}</td>
                      <td className="px-6 py-4 text-stone-500">
                        {u.phone ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : u.role === "STAFF"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.emailVerified ? (
                          <span className="text-emerald-600 text-xs font-medium">
                            ✓ Đã xác thực
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs">
                            Chưa xác thực
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {u.isActive ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(u.id)}
                          disabled={togglingId === u.id || u.role === "ADMIN"}
                          title={
                            u.role === "ADMIN"
                              ? "Không thể khóa ADMIN"
                              : u.isActive
                                ? "Khóa tài khoản"
                                : "Mở khóa"
                          }
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                            u.isActive
                              ? "text-red-500 hover:bg-red-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {u.isActive ? (
                            <ShieldOff size={15} />
                          ) : (
                            <ShieldCheck size={15} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
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
                onClick={() => setPageWithLoading(page - 1)}
                disabled={page === 0}
                className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPageWithLoading(page + 1)}
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
