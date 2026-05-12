package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.PlaceOrderRequest;
import com.toby.youngforever.dto.response.OrderResponse;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.enums.OrderStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface OrderService {
    OrderResponse placeOrder(UUID userId, PlaceOrderRequest request);

    @Transactional(readOnly = true)
    PageResponse<OrderResponse> getUserOrders(UUID userId, int page, int size);

    @Transactional(readOnly = true)
    OrderResponse getOrderDetail(UUID userId, UUID orderId);

    OrderResponse cancelOrder(UUID userId, UUID orderId, String reason);

    // ── Admin ─────────────────────────────────────────────
    OrderResponse updateStatus(UUID orderId, OrderStatus newStatus, String adminNote);
}
