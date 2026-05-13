package com.toby.youngforever.dto.response;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class NotificationResponse {
    private UUID id;
    private String type;
    private String title;
    private String body;
    private String imageUrl;
    private String actionUrl;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
