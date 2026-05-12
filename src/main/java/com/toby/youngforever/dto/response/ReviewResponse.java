package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder
public class ReviewResponse {
    private UUID id;
    private Short rating;
    private String title;
    private String comment;
    private Boolean isVerified;
    private Integer helpfulCount;
    private String authorName;
    private String authorAvatar;
    private List<String> images;
    private LocalDateTime createdAt;
}
