"use client";
// fe/src/app/admin/users/page.tsx  – ENHANCED version
// Changes vs original:
//  - Search by name/email/phone
//  - Filter by role
//  - Change role action (dropdown)
//  - Shows isVerified badge correctly (field is emailVerified in types)

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import type { UserResponse, PageResponse } from "@/types";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldOff,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

type UserRole = "ROLE_USER" | "ROLE_ADMIN" | "ROLE_STAFF";

const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_USER: "Khách hàng",
  ROLE_ADMIN: "Admin",
  ROLE_STAFF: "Nhân viên",
};

const ROLE_COLORS: Record<UserRole, string> = {
  ROLE_USER: "bg-stone-100 text-stone-600",
  ROLE_ADMIN: "bg-rose-100 text-rose-700",
  ROLE_STAFF: "bg-blue-100 text-blue-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setLoading(true);

      const params = new URLSearchParams({ page: String(page), size: "15" });
      if (search) params.set("keyword", search);
      if (roleFilter) params.set("role", roleFilter);

      axiosInstance
        .get<{ data: PageResponse<UserResponse> }>(`/admin/users?${params}`)
        .then((res) => {
          if (cancelled) return;
          setUsers(res.data.data.content);
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
  }, [page, search, roleFilter, refreshKey]);

  const handleToggle = async (userId: string) => {
    setTogglingId(userId);
    try {
      await axiosInstance.put(`/admin/users/${userId}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: !u.isActive } : u,
        ),
      );
      toast.success("Đã cập nhật trạng thái");
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setTogglingId(null);
    }
  };

  const handleChangeRole = async (userId: string, role: UserRole) => {
    setChangingRoleId(userId);
    try {
      await axiosInstance.patch(`/admin/users/${userId}/role?role=${role}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
      toast.success("Đã đổi role");
    } catch {
      toast.error("Đổi role thất bại");
    } finally {
      setChangingRoleId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800">
          Quản lý khách hàng
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          {totalItems.toLocaleString("vi-VN")} tài khoản
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
            placeholder="Tên, email, SĐT..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#E8A4B8] bg-white w-64"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as UserRole | "");
            setPage(0);
          }}
          className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white focus:outline-none focus:border-[#E8A4B8]"
        >
          <option value="">Tất cả role</option>
          <option value="ROLE_USER">Khách hàng</option>
          <option value="ROLE_STAFF">Nhân viên</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
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
                <th className="text-right px-6 py-3 font-medium">Thao tác</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-stone-400 text-sm"
                  >
                    Không có tài khoản nào
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#E8A4B8]/20 flex items-center justify-center text-[#C4829A] text-xs font-bold">
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-stone-800">
                          {u.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500">{u.email}</td>
                    <td className="px-6 py-4 text-stone-500">
                      {u.phone || "—"}
                    </td>

                    {/* Role – dropdown to change */}
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={u.role}
                          disabled={
                            changingRoleId === u.id || u.role === "ROLE_ADMIN"
                          }
                          onChange={(e) =>
                            handleChangeRole(u.id, e.target.value as UserRole)
                          }
                          className={`text-xs px-2.5 py-1 rounded-full font-medium appearance-none cursor-pointer pr-6 disabled:opacity-60 disabled:cursor-not-allowed ${
                            ROLE_COLORS[u.role as UserRole] ??
                            "bg-stone-100 text-stone-600"
                          }`}
                        >
                          <option value="ROLE_USER">Khách hàng</option>
                          <option value="ROLE_STAFF">Nhân viên</option>
                          <option value="ROLE_ADMIN">Admin</option>
                        </select>
                        <ChevronDown
                          size={10}
                          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.emailVerified
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {u.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleToggle(u.id)}
                          disabled={
                            togglingId === u.id || u.role === "ROLE_ADMIN"
                          }
                          title={
                            u.role === "ROLE_ADMIN"
                              ? "Không thể khóa Admin"
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
                      </div>
                    </td>
                  </tr>
                ))
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
