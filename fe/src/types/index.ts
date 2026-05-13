// ─── API Response wrapper ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ─── Auth ────────────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: "CUSTOMER" | "ADMIN" | "STAFF";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

// ─── Product ─────────────────────────────────────────────────
export interface ProductSummaryResponse {
  id: string;
  name: string;
  slug: string;
  primaryImageUrl?: string;

  // Giá
  price: number; // giá gốc
  salePrice?: number; // giá khuyến mãi (nếu có)
  effectivePrice: number; // = salePrice ?? price (backend tính sẵn)

  // Flags
  isOnSale?: boolean; // fe tự tính: salePrice != null
  discountPercent?: number; // fe tự tính: Math.round((price-salePrice)/price*100)
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;

  // Rating
  avgRating?: number; // backend field: avgRating (BigDecimal)
  reviewCount?: number;
  averageRating?: number; // alias nếu cần

  // Stock
  stock?: number;

  // Relations
  brand?: BrandSummary;
  category?: CategorySummary;
}

export interface ProductResponse extends ProductSummaryResponse {
  description?: string;
  ingredients?: string;
  howToUse?: string;
  images: ProductImageResponse[];
  variants: ProductVariantResponse[];
}

export interface ProductImageResponse {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariantResponse {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface BrandResponse extends BrandSummary {
  bannerUrl?: string;
  description?: string;
  country?: string;
  website?: string;
  isActive: boolean;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  children?: CategoryResponse[];
}
// ── Helper để tính discountPercent và isOnSale ───────────────────
export function enrichProduct(
  p: ProductSummaryResponse,
): ProductSummaryResponse & {
  isOnSale: boolean;
  discountPercent: number;
  originalPrice: number;
  averageRating?: number;
} {
  const originalPrice = p.price;
  const isOnSale = !!(p.salePrice && p.salePrice < p.price);
  const discountPercent =
    isOnSale && p.salePrice
      ? Math.round(((p.price - p.salePrice) / p.price) * 100)
      : 0;

  return {
    ...p,
    originalPrice,
    isOnSale,
    discountPercent,
    averageRating: p.avgRating,
  };
}

// ─── Cart ────────────────────────────────────────────────────
export interface CartResponse {
  items: CartItemResponse[];
  totalItems: number;
  totalPrice: number;
}

export interface CartItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantId?: string;
  variantName?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  availableStock: number;
}

// ─── Order ───────────────────────────────────────────────────
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "BANK_TRANSFER";
export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  shipFullName: string;
  shipPhone: string;
  shipAddress: string;
  customerNote?: string;
  items: OrderItemResponse[];
  createdAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

// ─── Payment ─────────────────────────────────────────────────
export interface PaymentUrlResponse {
  paymentId: string;
  paymentUrl: string;
  method: string;
  orderNumber: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

// ─── Address ─────────────────────────────────────────────────
export interface AddressResponse {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  ward?: string;
  district: string;
  city: string;
  country?: string;
  isDefault: boolean;
}

// ─── Review ──────────────────────────────────────────────────
export interface ReviewResponse {
  id: string;
  userId: string;
  userFullName: string;
  userAvatarUrl?: string;
  rating: number;
  title?: string;
  comment?: string;
  imageUrls?: string[];
  isVerified: boolean;
  createdAt: string;
}

// ─── Notification ────────────────────────────────────────────
export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ─── Banner ──────────────────────────────────────────────────
export interface BannerResponse {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  sortOrder: number;
}

// ─── Coupon ──────────────────────────────────────────────────
export interface CouponResponse {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  calculatedDiscount: number;
  expiresAt?: string;
}

// ─── Filter ──────────────────────────────────────────────────
export interface ProductFilterRequest {
  keyword?: string;
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price" | "createdAt" | "averageRating";
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
}
