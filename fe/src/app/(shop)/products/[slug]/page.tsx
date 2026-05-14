import { Suspense } from "react";
import { notFound } from "next/navigation";
import { productApi, reviewApi } from "@/lib/api";
import type { ProductResponse } from "@/types";
import ProductDetailClient from "@/components/product/detail/ProductDetailClient";
import RelatedProducts from "@/components/product/detail/ReleatedProducts";
import ProductDetailSkeleton from "@/components/product/detail/ProductDetailSkeleton";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string): Promise<ProductResponse | null> {
  try {
    const { data } = await productApi.getBySlug(slug);
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Sản phẩm không tìm thấy" };
  return {
    title: `${product.name} | YoungForever`,
    description: product.shortDesc ?? product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailClient product={product} />
        </Suspense>

        {/* Related Products */}
        {product.category?.id && (
          <Suspense fallback={null}>
            <RelatedProducts
              categoryId={product.category.id}
              currentProductId={product.id}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
