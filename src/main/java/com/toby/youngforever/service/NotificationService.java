package com.toby.youngforever.service;

import com.toby.youngforever.dto.response.NotificationResponse;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.entity.Order;

import java.util.UUID;

public interface NotificationService {
    void sendOrderPlaced(UUID userId, Order order);
    void sendOrderStatusUpdate(UUID userId, Order order);
    PageResponse<NotificationResponse> getUserNotifications(UUID userId, int page, int size);
    long countUnread(UUID userId);
    void markAllRead(UUID userId);
}