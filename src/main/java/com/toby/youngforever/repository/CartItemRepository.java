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

    @Query("SELECT c FROM CartItem c WHERE c.user.id = :userId AND c.product.id = :productId AND c.variant.id = :variantId")
    Optional<CartItem> findByUserProductVariant(
            @Param("userId") UUID userId,
            @Param("productId") UUID productId,
            @Param("variantId") UUID variantId);

    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.user.id = :userId")
    void clearCart(@Param("userId") UUID userId);
}
