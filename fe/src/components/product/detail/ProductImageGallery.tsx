"use client";

import { useState } from "react";
import { ShoppingBag, ZoomIn, X } from "lucide-react";
import type { ProductImageResponse } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  images: ProductImageResponse[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const current = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-rose-50 via-pink-50 to-stone-100 rounded-2xl flex items-center justify-center">
        <ShoppingBag size={64} strokeWidth={1} className="text-rose-200" />
      </div>
    );
  }

  return (
    <>
      {/* Layout: thumbnails dọc trái + ảnh chính phải */}
      <div className="flex gap-3">
        {/* Cột thumbnails dọc bên trái */}
        {sorted.length > 1 && (
          <div className="flex flex-col gap-2 w-16 shrink-0">
            {sorted.map((img, i) => (
              <button
                key={img.id ?? i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                  i === activeIndex
                    ? "border-rose-500 shadow-sm"
                    : "border-stone-100 hover:border-rose-300",
                )}
              >
                <img
                  src={img.url}
                  alt={img.altText ?? `${productName} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Ảnh chính */}
        <div
          className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-stone-50 group cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        >
          <img
            src={current?.url}
            alt={current?.altText ?? productName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <ZoomIn size={12} className="text-stone-500" />
            <span className="text-[10px] text-stone-500 font-medium">
              Phóng to
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox zoom */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            onClick={() => setIsZoomed(false)}
          >
            <X size={20} />
          </button>
          <img
            src={current?.url}
            alt={current?.altText ?? productName}
            className="max-w-full max-h-full object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
