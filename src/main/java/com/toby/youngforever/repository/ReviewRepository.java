package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByProductIdAndIsHiddenFalse(UUID productId, Pageable pageable);

    boolean existsByUserIdAndOrderItemId(UUID userId, UUID orderItemId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.isHidden = FALSE AND r.deletedAt IS NULL")
    Double avgRatingByProductId(@Param("productId") UUID productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.rating = :rating AND r.isHidden = FALSE")
    long countByProductIdAndRating(@Param("productId") UUID productId, @Param("rating") Short rating);
}
