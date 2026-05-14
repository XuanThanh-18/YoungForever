import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productApi } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import { ProductSummaryResponse } from "@/types";

interface Props {
  categoryId: string;
  currentProductId: string;
}
export default async function RelatedProducts({
  categoryId,
  currentProductId,
}: Props) {
  let products: ProductSummaryResponse[] = [];
  try {
    const { data } = await productApi.list({
      categoryId,
      size: 8,
      sortBy: "soldCount",
      sortDir: "desc",
    });
    // Loại trừ sản phẩm hiện tại
    products = (data.data.content ?? [])
      .filter((p: ProductSummaryResponse) => p.id !== currentProductId)
      .slice(0, 4);
  } catch {
    return null;
  }

  if (products.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xl font-bold text-stone-800 font-serif">
          Sản phẩm liên quan
        </h2>
        <Link
          href={`/products?categoryId=${categoryId}`}
          className="text-sm text-rose-600 hover:underline flex items-center gap-1"
        >
          Xem thêm <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
