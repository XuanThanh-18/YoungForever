"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Bell,
  LogOut,
  Settings,
  Package,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { totalItems, toggleCart } = useCartStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/products?keyword=${encodeURIComponent(searchQuery.trim())}`,
      );
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/products", label: "Sản phẩm" },
    { href: "/brands", label: "Thương hiệu" },
    { href: "/blogs", label: "Bài viết" },
    { href: "/about", label: "Về chúng tôi" },
  ];

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/98 backdrop-blur-md shadow-sm border-b border-stone-100"
            : "bg-white border-b border-stone-100",
        )}
      >
        {/* Announcement bar */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 text-white text-xs text-center py-2 tracking-widest font-medium">
          <span className="inline-flex items-center gap-2">
            <Sparkles size={11} />
            Miễn phí vận chuyển cho đơn hàng từ 500.000đ — Nhập BEAUTY15 giảm
            thêm 15%
            <Sparkles size={11} />
          </span>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                <span className="text-rose-500">Young</span>
                <span className="text-stone-800">Forever</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-stone-600 hover:text-rose-600 transition-colors font-medium relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-rose-500 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-rose-600 transition-colors"
                aria-label="Tìm kiếm"
              >
                <Search size={19} />
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  href="/wishlist"
                  className="p-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-rose-600 transition-colors"
                  aria-label="Yêu thích"
                >
                  <Heart size={19} />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-rose-600 transition-colors"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag size={19} />
                {totalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                    {totalItems() > 99 ? "99+" : totalItems()}
                  </span>
                )}
              </button>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-stone-50 transition-colors"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-100"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-300 flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                      </div>
                    )}
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-stone-400 transition-transform duration-200",
                        userMenuOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-semibold text-stone-800 truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <User size={15} /> Tài khoản của tôi
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Package size={15} /> Đơn hàng
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Settings size={15} /> Quản trị
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors mt-1 border-t border-stone-100"
                        >
                          <LogOut size={15} /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors px-3 py-1.5"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-full transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-stone-100 bg-white px-4 py-3 animate-in slide-in-from-top-2 duration-200">
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto relative"
            >
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                autoFocus
                className="w-full pl-11 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
              >
                <X size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-stone-100 bg-white animate-in slide-in-from-top-2 duration-200">
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-stone-100 flex gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 border border-stone-200 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
