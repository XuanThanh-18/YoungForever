package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.response.NotificationResponse;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.entity.Notification;
import com.toby.youngforever.entity.Order;
import com.toby.youngforever.enums.NotificationType;
import com.toby.youngforever.repository.NotificationRepository;
import com.toby.youngforever.repository.UserRepository;
import com.toby.youngforever.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Async
    @Override
    public void sendOrderPlaced(UUID userId, Order order) {
        save(userId,
                NotificationType.ORDER_PLACED,
                "Đặt hàng thành công! 🎉",
                "Đơn hàng " + order.getOrderNumber() + " đã được tiếp nhận. Tổng tiền: "
                        + formatVnd(order.getTotalAmount()),
                "/orders/" + order.getId());
    }

    @Async
    @Override
    public void sendOrderStatusUpdate(UUID userId, Order order) {
        NotificationType type;
        String title;
        String body;

        switch (order.getStatus()) {
            case CONFIRMED -> {
                type = NotificationType.ORDER_CONFIRMED;
                title = "Đơn hàng đã được xác nhận ✅";
                body = "Đơn hàng " + order.getOrderNumber() + " đã được xác nhận và đang chuẩn bị hàng.";
            }
            case SHIPPING -> {
                type = NotificationType.ORDER_SHIPPING;
                title = "Đơn hàng đang được giao 🚚";
                body = "Đơn hàng " + order.getOrderNumber() + " đang trên đường đến bạn.";
            }
            case DELIVERED -> {
                type = NotificationType.ORDER_DELIVERED;
                title = "Giao hàng thành công 📦";
                body = "Đơn hàng " + order.getOrderNumber() + " đã được giao. Cảm ơn bạn đã mua sắm!";
            }
            case CANCELLED -> {
                type = NotificationType.ORDER_CANCELLED;
                title = "Đơn hàng đã bị hủy ❌";
                body = "Đơn hàng " + order.getOrderNumber() + " đã bị hủy."
                        + (order.getCancelReason() != null ? " Lý do: " + order.getCancelReason() : "");
            }
            default -> { return; }
        }

        save(userId, type, title, body, "/orders/" + order.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getUserNotifications(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAllRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    // ── Helpers ─────────────────────────────────────────────
    private void save(UUID userId, NotificationType type,
                      String title, String body, String actionUrl) {
        try {
            Notification n = Notification.builder()
                    .user(userRepository.getReferenceById(userId))
                    .type(type)
                    .title(title)
                    .body(body)
                    .actionUrl(actionUrl)
                    .isRead(false)
                    .build();
            notificationRepository.save(n);
        } catch (Exception ex) {
            log.error("Failed to save notification for user {}: {}", userId, ex.getMessage());
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .title(n.getTitle())
                .body(n.getBody())
                .imageUrl(n.getImageUrl())
                .actionUrl(n.getActionUrl())
                .isRead(n.getIsRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private String formatVnd(java.math.BigDecimal amount) {
        return String.format("%,.0fđ", amount);
    }
}