import Link from "next/link";
import { PackageSearch, ArrowLeft, Search } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <PackageSearch
            size={36}
            strokeWidth={1.5}
            className="text-rose-400"
          />
        </div>

        <h1 className="text-2xl font-bold text-stone-800 font-serif mb-2">
          Sản phẩm không tìm thấy
        </h1>
        <p className="text-stone-500 text-sm mb-8 leading-relaxed">
          Sản phẩm bạn đang tìm có thể đã bị xóa hoặc không tồn tại. Hãy thử tìm
          kiếm sản phẩm khác.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors text-sm"
          >
            <Search size={15} />
            Tìm sản phẩm khác
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
          >
            <ArrowLeft size={15} />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
