import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format số tiền VND: 1500000 → "1.500.000đ" */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Format ngày: "2024-12-25T10:00:00" → "25/12/2024" */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Format ngày giờ: "2024-12-25T10:00:00" → "25/12/2024 10:00" */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Tính % giảm giá */
export function discountPercent(original: number, sale: number): number {
  if (!original || !sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/** Trạng thái đơn hàng → tiếng Việt */
export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao hàng",
  DELIVERED: "Đã giao hàng",
  CANCELLED: "Đã hủy",
};

/** Trạng thái thanh toán → tiếng Việt */
export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUNDED: "Đã hoàn tiền",
  CANCELLED: "Đã hủy",
};

/** Phương thức thanh toán → tiếng Việt */
export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VNPay",
  MOMO: "Ví MoMo",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

/** Rút gọn văn bản */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/** Render sao đánh giá */
export function renderStars(rating: number, max = 5): string {
  return "★".repeat(Math.round(rating)) + "☆".repeat(max - Math.round(rating));
}
