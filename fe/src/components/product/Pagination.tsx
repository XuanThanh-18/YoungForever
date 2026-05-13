"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number; // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  // Tạo danh sách số trang hiển thị (window = 5)
  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const current = page + 1; // 1-indexed cho UI

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    if (current > 3) pages.push("...");

    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(totalPages - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition-colors",
          page === 0
            ? "border-stone-100 text-stone-300 cursor-not-allowed"
            : "border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600",
        )}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Pages */}
      {getPages().map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            className="w-9 h-9 flex items-center justify-center text-stone-400 text-sm"
          >
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange((p as number) - 1)}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-medium transition-colors",
              page === (p as number) - 1
                ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                : "border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600",
            )}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className={cn(
          "w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition-colors",
          page >= totalPages - 1
            ? "border-stone-100 text-stone-300 cursor-not-allowed"
            : "border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600",
        )}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
