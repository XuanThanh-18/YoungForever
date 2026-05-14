import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Truck, Star, Gift } from "lucide-react";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/product/ProductCard";
import { productApi, bannerApi, categoryApi } from "@/lib/api";

async function getFeaturedProducts() {
  try {
    const { data } = await productApi.list({ size: 8, isFeatured: true });
    if (data.data.content.length === 0) {
      const fallback = await productApi.list({
        size: 8,
        sortBy: "createdAt",
        sortDir: "desc",
      });
      return fallback.data.data.content;
    }
    return data.data.content;
  } catch {
    return [];
  }
}

async function getBestSellers() {
  try {
    const { data } = await productApi.list({ size: 4, isBestSeller: true });
    return data.data.content;
  } catch {
    return [];
  }
}

async function getBanners() {
  try {
    const { data } = await bannerApi.getActive("HOME_HERO");
    return data.data;
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const { data } = await categoryApi.getAll();
    return data.data;
  } catch {
    return [];
  }
}

const FEATURES = [
  {
    icon: Truck,
    title: "Miễn phí vận chuyển",
    desc: "Cho đơn hàng từ 500K",
    color: "bg-blue-50 text-blue-500",
  },
  {
    icon: Shield,
    title: "Hàng chính hãng 100%",
    desc: "Cam kết hoàn tiền",
    color: "bg-emerald-50 text-emerald-500",
  },
  {
    icon: Gift,
    title: "Quà tặng hấp dẫn",
    desc: "Với mọi đơn hàng",
    color: "bg-amber-50 text-amber-500",
  },
  {
    icon: Sparkles,
    title: "Tư vấn chuyên nghiệp",
    desc: "Hỗ trợ 24/7",
    color: "bg-rose-50 text-rose-500",
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  "chăm-sóc-da": "✨",
  "trang-điểm": "💄",
  "chăm-sóc-tóc": "💆",
  "nước-hoa": "🌸",
  "chăm-sóc-cơ-thể": "🧴",
  "chống-nắng": "☀️",
};

function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "Xem tất cả",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2
          className="text-2xl sm:text-3xl font-bold text-stone-800"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-stone-400 mt-1.5">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
        >
          {linkLabel}
          <ArrowRight
            size={15}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [products, bestSellers, banners, categories] = await Promise.all([
    getFeaturedProducts(),
    getBestSellers(),
    getBanners(),
    getCategories(),
  ]);

  const heroBanner = banners[0];

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50/50 to-stone-50" />
        {/* Decorative blobs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-3xl" />

        {heroBanner?.imageUrl && (
          <img
            src={heroBanner.imageUrl}
            alt={heroBanner.title ?? "Hero banner"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-rose-200 text-rose-600 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase shadow-sm">
              <Sparkles size={12} />
              Bộ sưu tập mới 2025
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-800 leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {heroBanner?.title ?? (
                <>
                  Vẻ đẹp tự nhiên
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">
                    tỏa sáng mỗi ngày
                  </span>
                </>
              )}
            </h1>
            <p className="text-stone-500 text-lg mb-8 leading-relaxed max-w-xl">
              {heroBanner?.subtitle ??
                "Khám phá bộ sưu tập mỹ phẩm cao cấp được chọn lọc kỹ càng, phù hợp với mọi làn da người Việt."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={heroBanner?.linkUrl ?? "/products"}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:-translate-y-0.5 text-sm"
              >
                Khám phá ngay <ArrowRight size={16} />
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/80 backdrop-blur-sm hover:bg-white border border-stone-200 hover:border-rose-200 text-stone-700 font-semibold rounded-full transition-all duration-200 text-sm"
              >
                Thương hiệu
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-2">
                {["🌸", "💄", "✨", "🌿"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={12}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  <strong className="text-stone-700">10,000+</strong> khách hàng
                  tin tưởng
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="border-y border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-3 p-4 rounded-2xl hover:bg-stone-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}
                >
                  <f.icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-800 leading-tight">
                    {f.title}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeader
            title="Danh mục nổi bật"
            subtitle="Tìm sản phẩm phù hợp với nhu cầu của bạn"
            href="/products"
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categorySlug=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-4 sm:p-5 bg-stone-50 hover:bg-rose-50 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    (CATEGORY_ICONS[cat.slug] ?? "🌿")
                  )}
                </div>
                <span className="text-xs font-semibold text-stone-700 group-hover:text-rose-600 transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Best Sellers ─────────────────────────────────────── */}
      {bestSellers.length > 0 && (
        <section className="bg-gradient-to-b from-stone-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Bán chạy nhất"
              subtitle="Được hàng nghìn khách hàng yêu thích"
              href="/products?isBestSeller=true"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeader
          title="Sản phẩm nổi bật"
          subtitle="Tuyển chọn kỹ càng từ các thương hiệu uy tín"
          href="/products?isFeatured=true"
        />
        <Suspense
          fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          {products.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <span className="text-5xl mb-4 block">🌸</span>
              <p className="font-medium">Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Suspense>

        {products.length > 0 && (
          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-rose-200 text-rose-600 font-semibold rounded-full hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200 text-sm"
            >
              Xem tất cả sản phẩm <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>

      {/* ── Brand Banner ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-rose-400 text-xs font-bold tracking-widest uppercase mb-4">
            Thương hiệu cao cấp
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Mang thế giới làm đẹp
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300">
              đến tận tay bạn
            </span>
          </h2>
          <p className="text-stone-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Hơn 50+ thương hiệu quốc tế và nội địa uy tín. Chất lượng được kiểm
            định, cam kết hàng chính hãng 100%.
          </p>
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-full transition-all duration-200 shadow-lg shadow-rose-900/30 text-sm"
          >
            Khám phá thương hiệu <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 sm:p-12 text-center border border-rose-100">
          <span className="text-3xl mb-4 block">💌</span>
          <h3
            className="text-2xl sm:text-3xl font-bold text-stone-800 mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Nhận ưu đãi độc quyền
          </h3>
          <p className="text-stone-500 mb-6 text-sm max-w-md mx-auto">
            Đăng ký nhận bản tin để không bỏ lỡ các deal hot, ra mắt sản phẩm
            mới và mẹo làm đẹp.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-5 py-3.5 rounded-full border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-full text-sm transition-colors whitespace-nowrap"
            >
              Đăng ký ngay
            </button>
          </form>
          <p className="text-xs text-stone-400 mt-3">
            🔒 Chúng tôi tôn trọng quyền riêng tư của bạn
          </p>
        </div>
      </section>
    </div>
  );
}
