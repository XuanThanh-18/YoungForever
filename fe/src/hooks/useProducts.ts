import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { productApi, categoryApi, brandApi } from "@/lib/api";
import type { ProductFilterRequest } from "@/types";

export interface ProductFilters {
  keyword?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  skinType?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  inStock?: boolean;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  size?: number;
}

/** Đọc filters từ URL searchParams */
export function parseFiltersFromUrl(
  searchParams: URLSearchParams,
): ProductFilters {
  return {
    keyword: searchParams.get("keyword") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    brandId: searchParams.get("brandId") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    minRating: searchParams.get("minRating")
      ? Number(searchParams.get("minRating"))
      : undefined,
    skinType: searchParams.get("skinType") || undefined,
    isFeatured: searchParams.get("isFeatured") === "true" || undefined,
    isNewArrival: searchParams.get("isNewArrival") === "true" || undefined,
    isBestSeller: searchParams.get("isBestSeller") === "true" || undefined,
    inStock: searchParams.get("inStock") === "true" || undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortDir: searchParams.get("sortDir") || "desc",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
    size: searchParams.get("size") ? Number(searchParams.get("size")) : 20,
  };
}

/** Ghi filters ra URL */
export function buildUrlFromFilters(filters: ProductFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== false) {
      params.set(k, String(v));
    }
  });
  return params.toString();
}

function toProductFilterRequest(filters: ProductFilters): ProductFilterRequest {
  return {
    keyword: filters.keyword,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy as ProductFilterRequest["sortBy"],
    sortDir: filters.sortDir as ProductFilterRequest["sortDir"],
    page: filters.page,
    size: filters.size,
  };
}

/** Hook chính: fetch products + meta data */
export function useProducts(filters: ProductFilters) {
  const query = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await productApi.list(toProductFilterRequest(filters));
      return data.data;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
  return query;
}

/** Hook fetch danh sách categories */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryApi.getAll();
      return data.data;
    },
    staleTime: 300_000,
  });
}

/** Hook fetch danh sách brands */
export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data } = await brandApi.getAll();
      return data.data;
    },
    staleTime: 300_000,
  });
}

/** Hook quản lý filter + URL sync */
export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromUrl(searchParams),
    [searchParams],
  );

  const setFilters = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      const merged = { ...filters, ...newFilters, page: 0 };
      const qs = buildUrlFromFilters(merged);
      router.push(`${pathname}?${qs}`, { scroll: false });
    },
    [filters, pathname, router],
  );

  const setPage = useCallback(
    (page: number) => {
      const merged = { ...filters, page };
      const qs = buildUrlFromFilters(merged);
      router.push(`${pathname}?${qs}`, { scroll: true });
    },
    [filters, pathname, router],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.keyword ||
      filters.categoryId ||
      filters.brandId ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minRating ||
      filters.skinType ||
      filters.isFeatured ||
      filters.isNewArrival ||
      filters.isBestSeller ||
      filters.inStock
    );
  }, [filters]);

  return { filters, setFilters, setPage, resetFilters, hasActiveFilters };
}
