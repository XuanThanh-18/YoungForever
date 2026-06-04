package com.toby.youngforever.repository;

import com.toby.youngforever.entity.User;
import com.toby.youngforever.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /**
     * FIX: Lỗi "lower(bytea) does not exist" trên PostgreSQL xảy ra do Hibernate 6
     * bind tham số null dưới dạng bytea khi dùng JPQL.
     *
     * Chuyển sang native SQL với CAST(:keyword AS text) và CAST(:role AS varchar)
     * để PostgreSQL biết kiểu dữ liệu tường minh, tránh nhầm sang bytea.
     */
    @Query(value = """
        SELECT * FROM users u
        WHERE u.deleted_at IS NULL
          AND (
               CAST(:keyword AS text) IS NULL
               OR LOWER(u.full_name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
               OR LOWER(u.email)     LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
               OR u.phone             LIKE CONCAT('%', CAST(:keyword AS text), '%')
              )
          AND (CAST(:role AS varchar) IS NULL OR u.role = CAST(:role AS varchar))
        """,
            countQuery = """
        SELECT COUNT(*) FROM users u
        WHERE u.deleted_at IS NULL
          AND (
               CAST(:keyword AS text) IS NULL
               OR LOWER(u.full_name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
               OR LOWER(u.email)     LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
               OR u.phone            LIKE CONCAT('%', CAST(:keyword AS text), '%')
              )
          AND (CAST(:role AS varchar) IS NULL OR u.role = CAST(:role AS varchar))
        """,
            nativeQuery = true)
    Page<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("role") String role,       // FIX: đổi từ UserRole → String vì native query
            Pageable pageable);
}