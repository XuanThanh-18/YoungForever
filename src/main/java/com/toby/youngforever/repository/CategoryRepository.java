package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findBySlug(String slug);
    boolean existsBySlug(String slug);

    List<Category> findByParentIsNullAndIsActiveTrue();

    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId AND c.isActive = TRUE ORDER BY c.sortOrder")
    List<Category> findActiveByParentId(UUID parentId);

    // Admin: includes inactive, with keyword search
    @Query("""
        SELECT c FROM Category c
        WHERE (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:isActive IS NULL OR c.isActive = :isActive)
        """)
    Page<Category> adminSearch(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
}
