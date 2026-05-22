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
  role: "ROLE_USER" | "ROLE_ADMIN" | "ROLE_STAFF";
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
  images?: ProductImageResponse[];

  // Giá (số – frontend nhận về dạng number sau JSON parse)
  price: number;
  salePrice?: number;
  effectivePrice: number;

  // Flags
  isOnSale?: boolean;
  discountPercent?: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;

  // Rating – backend trả về field avgRating (BigDecimal → number)
  avgRating?: number;
  reviewCount?: number;

  // Stock
  stock?: number;

  // Relations
  brand?: BrandSummary;
  category?: CategorySummary;
}

export interface ProductResponse extends ProductSummaryResponse {
  description?: string;
  shortDesc?: string;
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

// ─── Filter request ──────────────────────────────────────────
export interface ProductFilterRequest {
  keyword?: string;
  categorySlug?: string;
  brandSlug?: string;
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
  sortBy?: "name" | "price" | "createdAt" | "avgRating" | "soldCount";
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
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
  | "CANCELLED"
  | "RETURNED";

export type PaymentMethod = "COD" | "VNPAY" | "MOMO" | "BANK_TRANSFER";
export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface OrderResponse {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  adminNote?: string;
  cancelReason?: string;
  items: OrderItemResponse[];
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
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
