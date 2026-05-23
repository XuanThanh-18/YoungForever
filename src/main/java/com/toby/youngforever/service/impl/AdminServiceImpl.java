package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.response.*;
import com.toby.youngforever.entity.*;
import com.toby.youngforever.enums.OrderStatus;
import com.toby.youngforever.enums.UserRole;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.mapper.OrderMapper;
import com.toby.youngforever.mapper.ProductMapper;
import com.toby.youngforever.mapper.UserMapper;
import com.toby.youngforever.repository.*;
import com.toby.youngforever.service.AdminService;
import com.toby.youngforever.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

/**
 * AdminServiceImpl – complete implementation.
 *
 * Image upload: saves to local /uploads/{uuid}.{ext}, returns relative URL.
 * Swap uploadImage() body with Cloudinary SDK when ready (commented below).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final OrderRepository    orderRepository;
    private final UserRepository     userRepository;
    private final ProductRepository  productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository    brandRepository;
    private final OrderService       orderService;
    private final OrderMapper        orderMapper;
    private final UserMapper         userMapper;
    private final ProductMapper      productMapper;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // ── Dashboard ──────────────────────────────────────────────
    @Override
    public Map<String, Object> getDashboardStats() {
        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        Map<String, Object> stats = new HashMap<>();
        stats.put("revenueToday",      orderRepository.sumRevenueBetween(startOfToday, now));
        stats.put("revenueThisMonth",  orderRepository.sumRevenueBetween(startOfMonth, now));
        stats.put("pendingOrders",     orderRepository.countByStatusSince(OrderStatus.PENDING,    startOfToday));
        stats.put("processingOrders",  orderRepository.countByStatusSince(OrderStatus.PROCESSING, startOfMonth));
        stats.put("deliveredToday",    orderRepository.countByStatusSince(OrderStatus.DELIVERED,  startOfToday));
        stats.put("cancelledToday",    orderRepository.countByStatusSince(OrderStatus.CANCELLED,  startOfToday));
        stats.put("totalUsers",        userRepository.count());
        stats.put("totalProducts",     productRepository.count());
        stats.put("totalOrders",       orderRepository.count());
        return stats;
    }

    // ── Orders ─────────────────────────────────────────────────
    @Override
    public PageResponse<OrderResponse> getAllOrders(
            OrderStatus status, String keyword, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Order> result;
        if (keyword != null && !keyword.isBlank()) {
            // search by orderNumber or customer name
            result = orderRepository.searchOrders(keyword.trim(), status, pageable);
        } else if (status != null) {
            result = orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            result = orderRepository.findAll(pageable);
        }
        return PageResponse.from(result.map(orderMapper::toResponse));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus status, String note) {
        return orderService.updateStatus(orderId, status, note);
    }

    // ── Users ──────────────────────────────────────────────────
    @Override
    public PageResponse<UserResponse> searchUsers(
            String keyword, UserRole role, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> result;
        if ((keyword == null || keyword.isBlank()) && role == null) {
            result = userRepository.findAll(pageable);
        } else {
            result = userRepository.searchUsers(
                    keyword != null ? keyword.trim() : null, role, pageable);
        }
        return PageResponse.from(result.map(userMapper::toResponse));
    }

    @Override
    @Transactional
    public void toggleUserActive(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse changeUserRole(UUID userId, UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Prevent self-demotion handled at controller/security level if needed
        user.setRole(role);
        return userMapper.toResponse(userRepository.save(user));
    }

    // ── Products ───────────────────────────────────────────────
    @Override
    public PageResponse<ProductSummaryResponse> adminListProducts(
            String keyword, UUID categoryId, UUID brandId, Boolean isActive, int page, int size) {
        var pageable = PageRequest.of(page, size); // ← bỏ Sort, đã có ORDER BY trong query
        Page<Product> result = productRepository.adminSearch(
                keyword,
                categoryId != null ? categoryId.toString() : null,
                brandId != null ? brandId.toString() : null,
                isActive,
                pageable);
        return PageResponse.from(result.map(productMapper::toSummary));
    }

    @Override
    @Transactional
    public void toggleProductActive(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        product.setIsActive(!product.getIsActive());
        productRepository.save(product);
    }

    @Override
    public PageResponse<ProductSummaryResponse> getLowStockProducts(int page, int size) {
        var pageable = PageRequest.of(page, size);
        return PageResponse.from(productRepository.findLowStockProducts(pageable)
                .map(productMapper::toSummary));
    }

    // ── Categories ─────────────────────────────────────────────
    @Override
    @Transactional
    public PageResponse<CategoryResponse> adminListCategories(
            String keyword, Boolean isActive, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("sortOrder").ascending()
                .and(Sort.by("name").ascending()));
        Page<Category> result = categoryRepository.adminSearch(keyword, isActive, pageable);
        return PageResponse.from(result.map(this::toCategoryResponse));
    }

    @Override
    @Transactional
    public void toggleCategoryActive(UUID categoryId) {
        Category cat = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        cat.setIsActive(!cat.getIsActive());
        categoryRepository.save(cat);
    }

    // ── Brands ─────────────────────────────────────────────────
    @Override
    public PageResponse<BrandResponse> adminListBrands(
            String keyword, Boolean isActive, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Brand> result = brandRepository.adminSearch(keyword, isActive, pageable);
        return PageResponse.from(result.map(this::toBrandResponse));
    }

    @Override
    @Transactional
    public void toggleBrandActive(UUID brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        brand.setIsActive(!brand.getIsActive());
        brandRepository.save(brand);
    }

    // ── Image Upload ───────────────────────────────────────────
    /**
     * Saves uploaded file to local disk and returns public URL.
     *
     * To switch to Cloudinary:
     * 1. Uncomment cloudinary dependency in pom.xml
     * 2. Replace body with:
     *    Map result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "youngforever"));
     *    return (String) result.get("secure_url");
     */
    @Override
    public String uploadImage(MultipartFile file) {
        validateImageFile(file);
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);

            String original  = Objects.requireNonNull(file.getOriginalFilename());
            String ext       = original.contains(".")
                    ? original.substring(original.lastIndexOf('.'))
                    : ".jpg";
            String filename  = UUID.randomUUID() + ext;
            Path   dest      = dir.resolve(filename);

            file.transferTo(dest.toFile());
            log.info("Image uploaded: {}", dest);
            return baseUrl + "/images/" + filename;
        } catch (IOException e) {
            log.error("Image upload failed", e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    // ── Private helpers ────────────────────────────────────────
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new AppException(ErrorCode.VALIDATION_FAILED);
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        if (file.getSize() > 5 * 1024 * 1024) throw new AppException(ErrorCode.FILE_TOO_LARGE);
    }

    private CategoryResponse toCategoryResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .sortOrder(c.getSortOrder())
                .isActive(c.getIsActive())
                .parent(c.getParent() != null
                        ? CategorySummary.builder()
                        .id(c.getParent().getId())
                        .name(c.getParent().getName())
                        .slug(c.getParent().getSlug())
                        .build()
                        : null)
                .children(c.getChildren() != null
                        ? c.getChildren().stream()
                        .filter(child -> child.getDeletedAt() == null)
                        .map(this::toCategoryResponse)  // ← đệ quy thay vì build CategorySummary
                        .toList()
                        : List.of())
                .build();
    }

    private BrandResponse toBrandResponse(Brand b) {
        return BrandResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .slug(b.getSlug())
                .logoUrl(b.getLogoUrl())
                .bannerUrl(b.getBannerUrl())
                .description(b.getDescription())
                .country(b.getCountry())
                .website(b.getWebsite())
                .isActive(b.getIsActive())
                .build();
    }
}