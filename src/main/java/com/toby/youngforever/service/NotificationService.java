package com.toby.youngforever.service;

import com.toby.youngforever.dto.response.NotificationResponse;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.entity.Order;
import com.toby.youngforever.enums.OrderStatus;

import java.math.BigDecimal;
import java.util.UUID;

public interface NotificationService {
    void sendOrderPlaced(UUID userId, String orderNumber, UUID orderId, BigDecimal totalAmount);
    void sendOrderStatusUpdate(UUID userId, String orderNumber, UUID orderId, OrderStatus status, String cancelReason);
    PageResponse<NotificationResponse> getUserNotifications(UUID userId, int page, int size);
    long countUnread(UUID userId);
    void markAllRead(UUID userId);
}