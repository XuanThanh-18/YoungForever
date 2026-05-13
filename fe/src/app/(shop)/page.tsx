import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Truck } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { productApi, bannerApi, categoryApi } from "@/lib/api";

async function getFeaturedProducts() {
  try {
    const { data } = await productApi.list({
      size: 8,
      sortBy: "createdAt",
      sortDir: "desc",
    });
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
  { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn hàng từ 500.000đ" },
  { icon: Shield, title: "Hàng chính hãng 100%", desc: "Cam kết hoàn tiền" },
  { icon: Sparkles, title: "Tư vấn chuyên nghiệp", desc: "Hỗ trợ 24/7" },
];

export default async function HomePage() {
  const [products, banners, categories] = await Promise.all([
    getFeaturedProducts(),
    getBanners(),
    getCategories(),
  ]);

  const heroBanner = banners[0];

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-[480px] sm:h-[560px] overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-stone-50">
        {heroBanner?.imageUrl ? (
          <img
            src={heroBanner.imageUrl}
            alt={heroBanner.title ?? "Banner"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-white">
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
          </div>
        )}

        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
          <div className="max-w-xl">
            <span className="inline-block bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide">
              ✨ Bộ sưu tập mới 2025
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-stone-800 leading-tight mb-4 font-serif">
              {heroBanner?.title ?? "Vẻ đẹp tự nhiên,"}
              <br />
              <span className="text-rose-600">
                {heroBanner?.subtitle ?? "tỏa sáng mỗi ngày"}
              </span>
            </h1>
            <p className="text-stone-500 text-base mb-6 leading-relaxed">
              Khám phá bộ sưu tập mỹ phẩm cao cấp được chọn lọc kỹ càng, phù hợp
              với mọi làn da người Việt.
            </p>
            <div className="flex gap-3">
              <Link
                href={heroBanner?.linkUrl ?? "/products"}
                className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-full hover:bg-rose-700 transition-colors flex items-center gap-2 text-sm"
              >
                Khám phá ngay <ArrowRight size={16} />
              </Link>
              <Link
                href="/brands"
                className="px-6 py-3 bg-white/80 backdrop-blur-sm text-stone-700 font-semibold rounded-full hover:bg-white transition-colors text-sm border border-stone-200"
              >
                Thương hiệu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-stone-100 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon size={18} className="text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {f.title}
                  </p>
                  <p className="text-xs text-stone-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-800 font-serif">
              Danh mục
            </h2>
            <Link
              href="/products"
              className="text-sm text-rose-600 hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?categorySlug=${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-rose-50 rounded-2xl transition-colors text-center"
              >
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-12 h-12 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-12 h-12 bg-rose-100 rounded-xl group-hover:bg-rose-200 transition-colors" />
                )}
                <span className="text-xs font-medium text-stone-700 group-hover:text-rose-700">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-800 font-serif">
              Sản phẩm nổi bật
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Được yêu thích nhất tuần này
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm text-rose-600 hover:underline flex items-center gap-1"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-stone-400">
            <p>Chưa có sản phẩm nào.</p>
          </div>
        )}
      </section>
    </>
  );
}
