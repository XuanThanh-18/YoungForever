package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.ApplyCouponRequest;
import com.toby.youngforever.dto.response.CouponResponse;
import com.toby.youngforever.entity.Coupon;

import java.math.BigDecimal;
import java.util.UUID;

public interface CouponService {
    CouponResponse apply(UUID userId, ApplyCouponRequest request);

    /** Validate + return coupon entity (used internally by OrderService) */
    Coupon validateAndGetCoupon(String code, UUID userId, BigDecimal orderValue);

    /** Calculate actual discount amount for the given order value */
    BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderValue);

    /** Record that the coupon was used in an order */
    void recordUsage(UUID couponId, UUID userId, UUID orderId);
}