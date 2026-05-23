package com.toby.youngforever.controller;

import com.toby.youngforever.dto.request.CreateBrandRequest;
import com.toby.youngforever.dto.request.CreateCategoryRequest;
import com.toby.youngforever.dto.request.CreateProductRequest;
import com.toby.youngforever.dto.request.UpdateProductRequest;
import com.toby.youngforever.dto.response.*;
import com.toby.youngforever.enums.OrderStatus;
import com.toby.youngforever.enums.UserRole;
import com.toby.youngforever.service.AdminService;
import com.toby.youngforever.service.BrandService;
import com.toby.youngforever.service.CategoryService;
import com.toby.youngforever.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

/**
 * AdminController – single entry-point for all /admin/** routes.
 *
 * Delegates to existing services (AdminService, ProductService, etc.)
 * so no business logic lives here.
 *
 * CHANGES vs original:
 *  - Added: product admin CRUD with search/filter
 *  - Added: category admin CRUD with search/pagination
 *  - Added: brand admin CRUD
 *  - Added: user search by keyword + role filter
 *  - Added: PATCH /admin/users/{id}/role
 *  - Added: POST /admin/upload  (multipart image upload)
 *  - Added: GET  /admin/products/low-stock
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Quản trị viên")
public class AdminController {

    private final AdminService   adminService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final BrandService   brandService;

    // ── Dashboard ────────────────────────────────────────────
    @GetMapping("/dashboard")
    @Operation(summary = "Thống kê tổng quan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // ── Orders ───────────────────────────────────────────────
    @GetMapping("/orders")
    @Operation(summary = "Danh sách đơn hàng – lọc theo status, phân trang")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.getAllOrders(status, keyword, page, size)));
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn hàng")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable UUID id,
            @RequestParam OrderStatus status,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.updateOrderStatus(id, status, note)));
    }

    // ── Users ────────────────────────────────────────────────
    @GetMapping("/users")
    @Operation(summary = "Danh sách user – tìm kiếm theo keyword, lọc role")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserRole role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.searchUsers(keyword, role, page, size)));
    }

    @PutMapping("/users/{id}/toggle-active")
    @Operation(summary = "Khóa / mở khóa tài khoản")
    public ResponseEntity<ApiResponse<Void>> toggleUserActive(@PathVariable UUID id) {
        adminService.toggleUserActive(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Đổi role user (USER ↔ STAFF ↔ ADMIN)")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable UUID id,
            @RequestParam UserRole role) {
        return ResponseEntity.ok(ApiResponse.success(adminService.changeUserRole(id, role)));
    }

    // ── Products (admin view: ALL including inactive) ─────────
    @GetMapping("/products")
    @Operation(summary = "Admin: toàn bộ sản phẩm kể cả inactive – tìm kiếm, phân trang")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> adminListProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID brandId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.adminListProducts(keyword, categoryId, brandId, isActive, page, size)));
    }

    @GetMapping("/products/low-stock")
    @Operation(summary = "Sản phẩm sắp hết hàng")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> lowStockProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getLowStockProducts(page, size)));
    }

    @PostMapping("/products")
    @Operation(summary = "Tạo sản phẩm mới")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(productService.create(request), "Tạo sản phẩm thành công"));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Cập nhật sản phẩm")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.update(id, request)));
    }

    @PatchMapping("/products/{id}/toggle-active")
    @Operation(summary = "Kích hoạt / ẩn sản phẩm")
    public ResponseEntity<ApiResponse<Void>> toggleProductActive(@PathVariable UUID id) {
        adminService.toggleProductActive(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Xóa mềm sản phẩm")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        productService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa sản phẩm"));
    }

    // ── Categories (admin view: includes inactive) ────────────
    @GetMapping("/categories")
    @Operation(summary = "Admin: toàn bộ danh mục – tìm kiếm, phân trang")
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> adminListCategories(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.adminListCategories(keyword, isActive, page, size)));
    }

    @PostMapping("/categories")
    @Operation(summary = "Tạo danh mục")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(categoryService.create(request)));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Cập nhật danh mục")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.update(id, request)));
    }

    @PatchMapping("/categories/{id}/toggle-active")
    @Operation(summary = "Kích hoạt / ẩn danh mục")
    public ResponseEntity<ApiResponse<Void>> toggleCategoryActive(@PathVariable UUID id) {
        adminService.toggleCategoryActive(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Xóa mềm danh mục")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        categoryService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ── Brands (admin view: includes inactive) ────────────────
    @GetMapping("/brands")
    @Operation(summary = "Admin: toàn bộ thương hiệu – tìm kiếm, phân trang")
    public ResponseEntity<ApiResponse<PageResponse<BrandResponse>>> adminListBrands(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.adminListBrands(keyword, isActive, page, size)));
    }

    @PostMapping("/brands")
    @Operation(summary = "Tạo thương hiệu")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(
            @Valid @RequestBody CreateBrandRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(brandService.create(request)));
    }

    @PutMapping("/brands/{id}")
    @Operation(summary = "Cập nhật thương hiệu")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable UUID id,
            @Valid @RequestBody CreateBrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success(brandService.update(id, request)));
    }

    @PatchMapping("/brands/{id}/toggle-active")
    @Operation(summary = "Kích hoạt / ẩn thương hiệu")
    public ResponseEntity<ApiResponse<Void>> toggleBrandActive(@PathVariable UUID id) {
        adminService.toggleBrandActive(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/brands/{id}")
    @Operation(summary = "Xóa mềm thương hiệu")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable UUID id) {
        brandService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ── Image Upload ──────────────────────────────────────────
    @PostMapping("/upload")
    @Operation(summary = "Upload ảnh – trả về URL (lưu disk hoặc Cloudinary)")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        String url = adminService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success(url, "Upload thành công"));
    }
}