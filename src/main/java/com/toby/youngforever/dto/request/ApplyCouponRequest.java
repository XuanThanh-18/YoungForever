package com.toby.youngforever.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ApplyCouponRequest {
    @NotBlank private String code;
    private BigDecimal orderValue;
}

