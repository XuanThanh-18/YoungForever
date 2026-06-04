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

    /**
     * FIX: Đổi JPQL → native SQL với CAST(:keyword AS text) tường minh.
     * Hibernate 6 + PostgreSQL bind tham số null dưới dạng bytea khi dùng JPQL,
     * khiến LOWER(?) gọi lower(bytea) không tồn tại → lỗi 42883.
     * Native SQL với CAST giải quyết triệt để vấn đề này.
     *
     * Cũng thêm c.deleted_at IS NULL vì @SQLRestriction bị bỏ qua trong @Query tùy chỉnh.
     */
    @Query(value = """
        SELECT * FROM categories c
        WHERE c.deleted_at IS NULL
          AND (CAST(:keyword AS text) IS NULL
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))
          AND (:isActive IS NULL OR c.is_active = :isActive)
        ORDER BY c.sort_order ASC, c.name ASC
        """,
            countQuery = """
        SELECT COUNT(*) FROM categories c
        WHERE c.deleted_at IS NULL
          AND (CAST(:keyword AS text) IS NULL
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))
          AND (:isActive IS NULL OR c.is_active = :isActive)
        """,
            nativeQuery = true)
    Page<Category> adminSearch(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
}