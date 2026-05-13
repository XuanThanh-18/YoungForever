package com.toby.youngforever.service;

import com.toby.youngforever.dto.response.OrderResponse;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.enums.OrderStatus;

import java.util.Map;
import java.util.UUID;

public interface AdminService {
    Map<String, Object> getDashboardStats();
    PageResponse<OrderResponse> getAllOrders(OrderStatus status, int page, int size);
    OrderResponse updateOrderStatus(UUID orderId, OrderStatus status, String note);
    PageResponse<?> getAllUsers(int page, int size);
    void toggleUserActive(UUID userId);
}