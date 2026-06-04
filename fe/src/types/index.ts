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
  sku?: string;
  primaryImageUrl?: string;
  images?: ProductImageResponse[];
  price: number;
  salePrice?: number;
  effectivePrice: number;
  isActive?: boolean;
  isOnSale?: boolean;
  discountPercent?: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  avgRating?: number;
  reviewCount?: number;
  stock?: number;
  brand?: BrandSummary;
  category?: CategorySummary;
}

export interface ProductResponse extends ProductSummaryResponse {
  description?: string;
  shortDesc?: string;
  ingredients?: string;
  howToUse?: string;
  skinType?: string;
  weightGram?: number;
  volumeMl?: number;
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
  sku?: string;
  price: number;
  salePrice?: number;
  stock: number;
  imageUrl?: string;
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

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  country?: string;
  website?: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  parent?: CategorySummary;
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
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  size?: number;
}

// ─── Order ───────────────────────────────────────────────────
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod = "COD" | "VNPAY" | "MOMO";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  // FIX Medium #4: backend trả về "hasReview", thêm cả "isReviewed" để tương thích
  hasReview?: boolean;
  isReviewed?: boolean;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  shipFullName?: string;
  shipPhone?: string;
  shipAddress?: string;
  couponCode?: string;
  customerNote?: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface PlaceOrderRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  customerNote?: string;
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
  country: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  street: string;
  ward?: string;
  district: string;
  city: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

// ─── Cart ────────────────────────────────────────────────────
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

// FIX Critical #2: backend trả về "totalAmount", không phải "totalPrice"
// Thêm cả hai để tránh breaking change với các component dùng totalPrice
export interface CartResponse {
  items: CartItemResponse[];
  totalItems: number;
  totalAmount: number;
  // Alias để tương thích ngược với code dùng totalPrice
  totalPrice?: number;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

// ─── Review ──────────────────────────────────────────────────
// FIX Critical #1: đồng bộ với những gì ReviewSection.tsx thực sự dùng
// Backend Java (ReviewResponse.java) trả về: authorName, authorAvatar, images (List<String>)
// ReviewSection.tsx dùng: userFullName, userAvatarUrl, imageUrls
// → Khai báo đủ các field để component không bị lỗi TS
export interface ReviewResponse {
  id: string;
  userId?: string;
  // Backend fields (authorName, authorAvatar) và FE-expected fields đều được khai báo
  userFullName: string;    // mapped từ authorName
  userAvatarUrl?: string;  // mapped từ authorAvatar
  // Giữ lại các field cũ phòng backend đổi
  userName?: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified?: boolean;
  helpfulCount?: number;
  imageUrls?: string[];    // FIX: ReviewSection dùng imageUrls (string[])
  images?: { id: string; url: string }[] | string[];  // tương thích cả hai dạng
  createdAt: string;
}

// ─── Coupon ──────────────────────────────────────────────────
export interface CouponResponse {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  calculatedDiscount: number;
  description?: string;
}

// ─── Payment ─────────────────────────────────────────────────
export interface PaymentUrlResponse {
  paymentUrl: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  paidAt?: string;
}

// ─── Banner ──────────────────────────────────────────────────
export interface BannerResponse {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  sortOrder?: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
}

// ─── Notification ─────────────────────────────────────────────
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