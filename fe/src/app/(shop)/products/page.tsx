import { Suspense } from "react";
import { categoryApi, brandApi } from "@/lib/api";
import type { CategoryResponse, BrandResponse } from "@/types";
import ProductsClient from "@/components/product/ProductsClient";

export const dynamic = "force-dynamic";

async function getCategories(): Promise<CategoryResponse[]> {
  try {
    const { data } = await categoryApi.getAll();
    return data.data ?? [];
  } catch {
    return [];
  }
}

async function getBrands(): Promise<BrandResponse[]> {
  try {
    const { data } = await brandApi.getAll();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={null}>
        <ProductsClient initialCategories={categories} initialBrands={brands} />
      </Suspense>
    </div>
  );
}
