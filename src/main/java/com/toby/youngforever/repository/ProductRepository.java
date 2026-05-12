package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
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

    Page<Product> findByCategoryId(UUID categoryId, Pageable pageable);
    Page<Product> findByBrandId(UUID brandId, Pageable pageable);

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
}
