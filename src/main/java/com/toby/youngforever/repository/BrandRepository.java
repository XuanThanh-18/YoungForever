package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Brand;
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
public interface BrandRepository extends JpaRepository<Brand, UUID> {

    Optional<Brand> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Brand> findByIsActiveTrueOrderByName();

    /**
     * FIX: Đổi JPQL → native SQL với CAST(:keyword AS text) tường minh.
     * Hibernate 6 + PostgreSQL bind tham số null dưới dạng bytea khi dùng JPQL,
     * khiến LOWER(?) gọi lower(bytea) không tồn tại → lỗi 42883.
     *
     * Cũng thêm b.deleted_at IS NULL vì @SQLRestriction bị bỏ qua trong @Query tùy chỉnh.
     */
    @Query(value = """
        SELECT * FROM brands b
        WHERE b.deleted_at IS NULL
          AND (CAST(:keyword AS text) IS NULL
               OR LOWER(b.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))
          AND (:isActive IS NULL OR b.is_active = :isActive)
        ORDER BY b.name ASC
        """,
            countQuery = """
        SELECT COUNT(*) FROM brands b
        WHERE b.deleted_at IS NULL
          AND (CAST(:keyword AS text) IS NULL
               OR LOWER(b.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%')))
          AND (:isActive IS NULL OR b.is_active = :isActive)
        """,
            nativeQuery = true)
    Page<Brand> adminSearch(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
}