package com.toby.youngforever.repository;

import com.toby.youngforever.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByUserId(UUID userId);

    /**
     * FIX BUG 2: Tách thành 2 query vì JPQL không xử lý được IS NULL
     * trên navigation path (c.variant.id = null sẽ throw exception).
     * CartServiceImpl sẽ gọi method phù hợp tuỳ variantId có null hay không.
     */
    @Query("""
        SELECT c FROM CartItem c
        WHERE c.user.id = :userId
          AND c.product.id = :productId
          AND c.variant.id = :variantId
        """)
    Optional<CartItem> findByUserProductAndVariant(
            @Param("userId") UUID userId,
            @Param("productId") UUID productId,
            @Param("variantId") UUID variantId);

    @Query("""
        SELECT c FROM CartItem c
        WHERE c.user.id = :userId
          AND c.product.id = :productId
          AND c.variant IS NULL
        """)
    Optional<CartItem> findByUserProductNoVariant(
            @Param("userId") UUID userId,
            @Param("productId") UUID productId);

    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.user.id = :userId")
    void clearCart(@Param("userId") UUID userId);

    @Query("""
    SELECT c FROM CartItem c 
    LEFT JOIN FETCH c.product p 
    LEFT JOIN FETCH p.images
    LEFT JOIN FETCH c.variant
    WHERE c.user.id = :userId
    ORDER BY c.addedAt DESC
    """)
    List<CartItem> findByUserIdWithDetails(@Param("userId") UUID userId);
}