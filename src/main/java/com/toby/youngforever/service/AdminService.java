package com.toby.youngforever.service;

import com.toby.youngforever.dto.response.*;
import com.toby.youngforever.enums.OrderStatus;
import com.toby.youngforever.enums.UserRole;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

/**
 * AdminService – thêm các method còn thiếu so với AdminController mới.
 *
 * CHANGES:
 *  - getAllOrders thêm param keyword
 *  - searchUsers thay getAllUsers
 *  - changeUserRole (mới)
 *  - adminListProducts / toggleProductActive (mới)
 *  - adminListCategories / toggleCategoryActive (mới)
 *  - adminListBrands / toggleBrandActive (mới)
 *  - getLowStockProducts (mới)
 *  - uploadImage (mới)
 */
public interface AdminService {

    // Dashboard
    Map<String, Object> getDashboardStats();

    // Orders
    PageResponse<OrderResponse> getAllOrders(OrderStatus status, String keyword, int page, int size);
    OrderResponse updateOrderStatus(UUID orderId, OrderStatus status, String note);

    // Users
    PageResponse<UserResponse> searchUsers(String keyword, UserRole role, int page, int size);
    void toggleUserActive(UUID userId);
    UserResponse changeUserRole(UUID userId, UserRole role);

    // Products (admin: all)
    PageResponse<ProductSummaryResponse> adminListProducts(
            String keyword, UUID categoryId, UUID brandId, Boolean isActive, int page, int size);
    void toggleProductActive(UUID productId);
    PageResponse<ProductSummaryResponse> getLowStockProducts(int page, int size);

    // Categories (admin: all)
    PageResponse<CategoryResponse> adminListCategories(String keyword, Boolean isActive, int page, int size);
    void toggleCategoryActive(UUID categoryId);

    // Brands (admin: all)
    PageResponse<BrandResponse> adminListBrands(String keyword, Boolean isActive, int page, int size);
    void toggleBrandActive(UUID brandId);

    // Upload
    String uploadImage(MultipartFile file);
}