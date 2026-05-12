package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
