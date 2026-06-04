package com.toby.youngforever.repository;

import com.toby.youngforever.entity.Order;
import com.toby.youngforever.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.createdAt >= :since")
    long countByStatusSince(@Param("status") OrderStatus status, @Param("since") LocalDateTime since);

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o
        WHERE o.status = :status
          AND o.deliveredAt BETWEEN :from AND :to
        """)
    BigDecimal sumRevenueBetween(
            @Param("status") OrderStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.id = :orderId")
    Optional<Order> findByIdAndUserId(@Param("orderId") UUID orderId, @Param("userId") UUID userId);

    /**
     * FIX: Lỗi "lower(bytea) does not exist" trên PostgreSQL xảy ra do Hibernate 6
     * bind tham số null dưới dạng bytea thay vì varchar khi dùng JPQL.
     *
     * Giải pháp: chuyển sang native SQL với CAST(:keyword AS text) tường minh.
     * PostgreSQL sẽ biết đúng kiểu dữ liệu và không bị nhầm sang bytea.
     *
     * Cũng thêm CAST(:status AS varchar) để tránh lỗi tương tự cho enum param.
     */
    @Query(value = """
        SELECT * FROM orders o
        WHERE (CAST(:status AS varchar) IS NULL OR o.status = CAST(:status AS varchar))
          AND (
               CAST(:keyword AS text) IS NULL
               OR LOWER(o.order_number)   LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
               OR LOWER(o.ship_full_name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
               OR LOWER(o.ship_phone)     LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
              )
        ORDER BY o.created_at DESC
        """,
            countQuery = """
        SELECT COUNT(*) FROM orders o
        WHERE (CAST(:status AS varchar) IS NULL OR o.status = CAST(:status AS varchar))
          AND (
               CAST(:keyword AS text) IS NULL
               OR LOWER(o.order_number)   LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
               OR LOWER(o.ship_full_name) LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
               OR LOWER(o.ship_phone)     LIKE LOWER(CONCAT('%', CAST(:keyword AS text), '%'))
              )
        """,
            nativeQuery = true)
    Page<Order> searchOrders(
            @Param("keyword") String keyword,
            @Param("status") String status,   // FIX: đổi từ OrderStatus → String vì native query
            Pageable pageable);
}