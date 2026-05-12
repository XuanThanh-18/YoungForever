package com.toby.youngforever.dto.response;

import com.toby.youngforever.enums.DiscountType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class CouponResponse {
    private UUID id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscount;
    private BigDecimal calculatedDiscount;
    private LocalDateTime expiresAt;
}