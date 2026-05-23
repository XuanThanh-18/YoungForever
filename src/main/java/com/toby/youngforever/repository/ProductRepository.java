package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>,
        JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);

    @Query("SELECT p FROM Product p WHERE p.isFeatured = TRUE AND p.isActive = TRUE")
    Page<Product> findFeatured(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isNewArrival = TRUE AND p.isActive = TRUE ORDER BY p.createdAt DESC")
    Page<Product> findNewArrivals(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isBestSeller = TRUE AND p.isActive = TRUE")
    Page<Product> findBestSellers(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.stock <= p.lowStockAlert AND p.isActive = TRUE")
    Page<Product> findLowStockProducts(Pageable pageable);

    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Product p SET p.soldCount = p.soldCount + :qty WHERE p.id = :id")
    void incrementSoldCount(@Param("id") UUID id, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock - :qty WHERE p.id = :id AND p.stock >= :qty")
    int decrementStock(@Param("id") UUID id, @Param("qty") int qty);

    /**
     * FIX BUG 3:
     * - Bỏ ::text cast không cần thiết (PostgreSQL LOWER() chấp nhận varchar trực tiếp)
     * - Dùng CAST(:categoryId AS uuid) và CAST(:brandId AS uuid) đúng cách
     * - Thêm parentheses để AND/OR ưu tiên đúng trong điều kiện keyword
     */
    @Query(value = """
        SELECT * FROM products p
        WHERE p.deleted_at IS NULL
          AND (
               :keyword IS NULL
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.sku)  LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
          AND (CAST(:categoryId AS uuid) IS NULL OR p.category_id = CAST(:categoryId AS uuid))
          AND (CAST(:brandId    AS uuid) IS NULL OR p.brand_id    = CAST(:brandId    AS uuid))
          AND (:isActive IS NULL OR p.is_active = CAST(:isActive AS boolean))
        ORDER BY p.created_at DESC
        """,
            countQuery = """
        SELECT COUNT(*) FROM products p
        WHERE p.deleted_at IS NULL
          AND (
               :keyword IS NULL
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.sku)  LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
          AND (CAST(:categoryId AS uuid) IS NULL OR p.category_id = CAST(:categoryId AS uuid))
          AND (CAST(:brandId    AS uuid) IS NULL OR p.brand_id    = CAST(:brandId    AS uuid))
          AND (:isActive IS NULL OR p.is_active = CAST(:isActive AS boolean))
        """,
            nativeQuery = true)
    Page<Product> adminSearch(
            @Param("keyword")    String keyword,
            @Param("categoryId") String categoryId,
            @Param("brandId")    String brandId,
            @Param("isActive")   Boolean isActive,
            Pageable pageable);
}