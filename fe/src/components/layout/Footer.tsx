import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xl font-bold text-white font-serif mb-3">
              YoungForever
            </p>
            <p className="text-sm text-stone-400 leading-relaxed">
              Mỹ phẩm cao cấp, vẻ đẹp tự nhiên. Được tin tưởng bởi hàng nghìn
              khách hàng.
            </p>
          </div>

          {/* Products */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">Sản phẩm</p>
            <ul className="space-y-2">
              {["Chăm sóc da", "Trang điểm", "Chăm sóc tóc", "Nước hoa"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="/products"
                      className="text-sm text-stone-400 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">Hỗ trợ</p>
            <ul className="space-y-2">
              {[
                { label: "Chính sách đổi trả", href: "/chinh-sach" },
                { label: "Hướng dẫn mua hàng", href: "/huong-dan" },
                { label: "Liên hệ", href: "/lien-he" },
                { label: "Bài viết", href: "/blogs" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-stone-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-white mb-3">Liên hệ</p>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>📧 hello@youngforever.vn</li>
              <li>📞 1900 xxxx</li>
              <li>📍 Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>

        <hr className="border-stone-800 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© 2025 YoungForever. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-white">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
