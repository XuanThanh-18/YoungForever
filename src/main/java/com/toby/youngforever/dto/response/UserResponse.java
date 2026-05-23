package com.toby.youngforever.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String role;
    private Boolean isActive;

    // FIX: frontend expects "emailVerified" but backend field was "isVerified"
    @JsonProperty("emailVerified")
    private Boolean isVerified;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
