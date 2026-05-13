package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class BannerResponse {
    private UUID id;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String linkUrl;
    private String position;
    private Integer sortOrder;
    private Boolean isActive;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
}