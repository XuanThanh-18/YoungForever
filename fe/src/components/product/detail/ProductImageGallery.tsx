"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag, ZoomIn } from "lucide-react";
import type { ProductImageResponse } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  images: ProductImageResponse[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Sắp xếp: primary trước
  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const current = sorted[activeIndex];

  const prev = () =>
    setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length);
  const next = () => setActiveIndex((i) => (i + 1) % sorted.length);

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-rose-50 via-pink-50 to-stone-100 rounded-2xl flex items-center justify-center">
        <ShoppingBag size={64} strokeWidth={1} className="text-rose-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 group cursor-zoom-in"
        onClick={() => setIsZoomed(true)}
      >
        <img
          src={current?.url}
          alt={current?.altText ?? productName}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            "group-hover:scale-105",
          )}
        />

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          <ZoomIn size={12} className="text-stone-500" />
          <span className="text-[10px] text-stone-500 font-medium">
            Phóng to
          </span>
        </div>

        {/* Nav arrows (only if multiple) */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft size={16} className="text-stone-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight size={16} className="text-stone-600" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(i);
                  }}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === activeIndex ? "bg-rose-600 w-4" : "bg-white/70",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
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

      {/* Lightbox */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current?.url}
              alt={current?.altText ?? productName}
              className="w-full h-auto rounded-2xl"
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-lg font-bold"
            >
              ×
            </button>
            {sorted.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
