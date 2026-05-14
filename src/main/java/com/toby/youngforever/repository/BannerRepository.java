package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BannerRepository extends JpaRepository<Banner, UUID> {

    @Query("""
            SELECT b FROM Banner b
            WHERE b.isActive = TRUE
              AND b.position = :position
              AND (b.startsAt IS NULL OR b.startsAt <= CURRENT_TIMESTAMP)
              AND (b.expiresAt IS NULL OR b.expiresAt >= CURRENT_TIMESTAMP)
            ORDER BY b.sortOrder ASC
            """)
    List<Banner> findActiveByPosition(String position);

    List<Banner> findByIsActiveTrueOrderBySortOrderAsc();
}