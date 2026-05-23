"use client";
// fe/src/app/admin/layout.tsx  – FIXED version
// Changes:
//  - Added "Đơn hàng" and "Thương hiệu" nav items (were in NAV_ITEMS but
//    the brands/orders pages didn't exist — now they do)
//  - Fixed active state detection for nested routes

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Star,
  LogOut,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/users", label: "Khách hàng", icon: Users },
  { href: "/admin/categories", label: "Danh mục", icon: Tags },
  { href: "/admin/brands", label: "Thương hiệu", icon: Star },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setHasHydrated(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user || user.role !== "ROLE_ADMIN") router.replace("/login");
  }, [user, router, hasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F5]">
        <div className="w-6 h-6 border-2 border-[#E8A4B8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "ROLE_ADMIN") return null;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#F9F7F5]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#1A1614] text-white flex flex-col min-h-screen">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#E8A4B8]" />
            <span className="font-bold text-lg tracking-wide">
              YoungForever
            </span>
          </div>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            // FIX: exact match for dashboard, prefix match for others
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  {item.label}
                </div>
                {active && <ChevronRight size={14} className="text-white/40" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-6 border-t border-white/10 pt-4">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-white/60 truncate">{user.fullName}</p>
            <p className="text-[10px] text-white/30 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
