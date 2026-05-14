"use client";

import { useState } from "react";
import type { ProductResponse } from "@/types";
import { cn } from "@/lib/utils";
import ReviewSection from "./ReviewSection";

interface Props {
  product: ProductResponse;
}

const TABS = [
  { key: "description", label: "Mô tả" },
  { key: "ingredients", label: "Thành phần" },
  { key: "howToUse", label: "Hướng dẫn sử dụng" },
  { key: "reviews", label: "Đánh giá" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ProductTabs({ product }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("description");

  // Ẩn tab nếu không có nội dung (trừ reviews)
  const visibleTabs = TABS.filter((t) => {
    if (t.key === "reviews") return true;
    if (t.key === "description") return !!product.description;
    if (t.key === "ingredients") return !!product.ingredients;
    if (t.key === "howToUse") return !!product.howToUse;
    return true;
  });

  // Đảm bảo activeTab hợp lệ
  const currentTab = visibleTabs.find((t) => t.key === activeTab)
    ? activeTab
    : (visibleTabs[0]?.key ?? "description");

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden mb-8">
      {/* Tab navigation */}
      <div className="flex border-b border-stone-100 overflow-x-auto scrollbar-hide">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-shrink-0 px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px",
              currentTab === tab.key
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-stone-500 hover:text-stone-700",
            )}
          >
            {tab.label}
            {tab.key === "reviews" && (product.reviewCount ?? 0) > 0 && (
              <span className="ml-1.5 text-[10px] bg-rose-100 text-rose-600 font-bold px-1.5 py-0.5 rounded-full">
                {product.reviewCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 lg:p-8">
        {currentTab === "description" && (
          <div className="prose prose-stone prose-sm max-w-none">
            {product.description ? (
              <div
                className="text-stone-600 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-stone-400 italic">Chưa có thông tin mô tả.</p>
            )}
          </div>
        )}

        {currentTab === "ingredients" && (
          <div>
            {product.ingredients ? (
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {product.ingredients}
              </p>
            ) : (
              <p className="text-stone-400 italic text-sm">
                Chưa có thông tin thành phần.
              </p>
            )}
          </div>
        )}

        {currentTab === "howToUse" && (
          <div>
            {product.howToUse ? (
              <div className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {product.howToUse}
              </div>
            ) : (
              <p className="text-stone-400 italic text-sm">
                Chưa có hướng dẫn sử dụng.
              </p>
            )}
          </div>
        )}

        {currentTab === "reviews" && (
          <ReviewSection
            productId={product.id}
            avgRating={Number(product.avgRating ?? 0)}
            reviewCount={product.reviewCount ?? 0}
          />
        )}
      </div>
    </div>
  );
}
