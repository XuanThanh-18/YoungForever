"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Heart, User, Search, Menu, X, Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();

  const navLinks = [
    { href: "/products", label: "Sản phẩm" },
    { href: "/brands", label: "Thương hiệu" },
    { href: "/blogs", label: "Bài viết" },
    { href: "/about", label: "Về chúng tôi" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100">
      {/* Top bar */}
      <div className="bg-rose-600 text-white text-xs text-center py-1.5 tracking-wide">
        🌸 Miễn phí vận chuyển cho đơn hàng trên 500.000đ
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md text-stone-600 hover:bg-stone-50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-rose-600 tracking-tight font-serif">
              YoungForever
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-stone-600 hover:text-rose-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full text-stone-600 hover:bg-stone-50 hover:text-rose-600 transition-colors"
              aria-label="Tìm kiếm"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                href="/wishlist"
                className="p-2 rounded-full text-stone-600 hover:bg-stone-50 hover:text-rose-600 transition-colors"
                aria-label="Yêu thích"
              >
                <Heart size={20} />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full text-stone-600 hover:bg-stone-50 hover:text-rose-600 transition-colors"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag size={20} />
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {totalItems() > 99 ? "99+" : totalItems()}
                </span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-50 transition-colors">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-100"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-sm font-semibold">
                      {user?.fullName?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Bell size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <User size={15} /> Tài khoản
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <ShoppingBag size={15} /> Đơn hàng
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Heart size={15} /> Yêu thích
                  </Link>
                  <hr className="my-1 border-stone-100" />
                  <button
                    onClick={() => useAuthStore.getState().logout()}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-full hover:bg-rose-700 transition-colors"
              >
                <User size={15} />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-3 animate-in slide-in-from-top-2 duration-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/products?keyword=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="relative"
            >
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-stone-100 bg-white animate-in slide-in-from-top-2 duration-200">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-rose-600 font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-stone-700"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
