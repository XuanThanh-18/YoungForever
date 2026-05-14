import api from "@/lib/axios";
import type {
  ApiResponse,
  PageResponse,
  AuthResponse,
  UserResponse,
  AddressResponse,
  ProductSummaryResponse,
  ProductResponse,
  BrandResponse,
  CategoryResponse,
  CartResponse,
  CartItemResponse,
  OrderResponse,
  PaymentUrlResponse,
  PaymentResponse,
  ReviewResponse,
  BannerResponse,
  CouponResponse,
  NotificationResponse,
  ProductFilterRequest,
} from "@/types";

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>("/auth/refresh", { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<void>>("/auth/forgot-password", { email }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post<ApiResponse<void>>("/auth/reset-password", data),

  verifyEmail: (token: string) =>
    api.post<ApiResponse<void>>("/auth/verify-email", { token }),
};

// ─── User ────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get<ApiResponse<UserResponse>>("/users/me"),

  updateProfile: (data: { fullName?: string; phone?: string }) =>
    api.put<ApiResponse<UserResponse>>("/users/me", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<void>>("/users/me/password", data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<string>>("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getAddresses: () =>
    api.get<ApiResponse<AddressResponse[]>>("/users/me/addresses"),

  createAddress: (data: Omit<AddressResponse, "id">) =>
    api.post<ApiResponse<AddressResponse>>("/users/me/addresses", data),

  updateAddress: (id: string, data: Partial<AddressResponse>) =>
    api.put<ApiResponse<AddressResponse>>(`/users/me/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    api.delete<ApiResponse<void>>(`/users/me/addresses/${id}`),

  getNotifications: (page = 0) =>
    api.get<ApiResponse<PageResponse<NotificationResponse>>>(
      "/users/me/notifications",
      { params: { page } },
    ),

  markAllNotificationsRead: () =>
    api.post<ApiResponse<void>>("/users/me/notifications/read-all"),
};

// ─── Products ────────────────────────────────────────────────
export const productApi = {
  list: (filter: {
    keyword?: string;
    categoryId?: string; // UUID
    brandId?: string; // UUID
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
  }) =>
    api.get<ApiResponse<PageResponse<ProductSummaryResponse>>>("/products", {
      params: filter,
    }),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<ProductResponse>>(`/products/${slug}`),
};
// ─── Categories ──────────────────────────────────────────────
export const categoryApi = {
  getAll: () => api.get<ApiResponse<CategoryResponse[]>>("/categories"),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<CategoryResponse>>(`/categories/${slug}`),
};

// ─── Brands ──────────────────────────────────────────────────
export const brandApi = {
  getAll: () => api.get<ApiResponse<BrandResponse[]>>("/brands"),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<BrandResponse>>(`/brands/${slug}`),
};

// ─── Banners ─────────────────────────────────────────────────
export const bannerApi = {
  getActive: (position = "HOME_HERO") =>
    api.get<ApiResponse<BannerResponse[]>>("/banners", {
      params: { position },
    }),
};

// ─── Cart ────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get<ApiResponse<CartResponse>>("/cart"),

  addItem: (productId: string, quantity: number, variantId?: string) =>
    api.post<ApiResponse<CartResponse>>("/cart/items", {
      productId,
      quantity,
      variantId,
    }),

  updateItem: (itemId: string, quantity: number) =>
    api.put<ApiResponse<CartResponse>>(`/cart/items/${itemId}`, null, {
      params: { quantity },
    }),

  removeItem: (itemId: string) =>
    api.delete<ApiResponse<void>>(`/cart/items/${itemId}`),

  clear: () => api.delete<ApiResponse<void>>("/cart"),
};

// ─── Orders ──────────────────────────────────────────────────
export const orderApi = {
  place: (data: {
    addressId: string;
    paymentMethod: string;
    couponCode?: string;
    customerNote?: string;
  }) => api.post<ApiResponse<OrderResponse>>("/orders", data),

  getMyOrders: (page = 0, size = 10) =>
    api.get<ApiResponse<PageResponse<OrderResponse>>>("/orders", {
      params: { page, size },
    }),

  getById: (id: string) => api.get<ApiResponse<OrderResponse>>(`/orders/${id}`),

  cancel: (id: string, reason?: string) =>
    api.post<ApiResponse<OrderResponse>>(`/orders/${id}/cancel`, null, {
      params: { reason },
    }),
};

// ─── Payments ────────────────────────────────────────────────
export const paymentApi = {
  createVnpay: (orderId: string, returnUrl?: string) =>
    api.post<ApiResponse<PaymentUrlResponse>>("/payments/vnpay/create", {
      orderId,
      returnUrl: returnUrl || window.location.origin + "/checkout/result",
    }),

  createMomo: (orderId: string) =>
    api.post<ApiResponse<PaymentUrlResponse>>("/payments/momo/create", {
      orderId,
    }),

  getStatus: (orderId: string) =>
    api.get<ApiResponse<PaymentResponse>>(`/payments/orders/${orderId}/status`),
};

// ─── Wishlist ────────────────────────────────────────────────
export const wishlistApi = {
  get: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<ProductSummaryResponse>>>("/wishlist", {
      params: { page, size },
    }),

  toggle: (productId: string) =>
    api.post<ApiResponse<void>>(`/wishlist/${productId}`),

  check: (productId: string) =>
    api.get<ApiResponse<boolean>>(`/wishlist/${productId}/check`),
};

// ─── Reviews ─────────────────────────────────────────────────
export const reviewApi = {
  getProductReviews: (productId: string, page = 0, size = 5) =>
    api.get<ApiResponse<PageResponse<ReviewResponse>>>(
      `/reviews/product/${productId}`,
      {
        params: { page, size },
      },
    ),

  create: (data: {
    productId: string;
    orderItemId: string;
    rating: number;
    title?: string;
    comment?: string;
    imageUrls?: string[];
  }) => api.post<ApiResponse<ReviewResponse>>("/reviews", data),
};

// ─── Coupons ─────────────────────────────────────────────────
export const couponApi = {
  apply: (code: string, orderValue: number) =>
    api.post<ApiResponse<CouponResponse>>("/coupons/apply", {
      code,
      orderValue,
    }),
};
