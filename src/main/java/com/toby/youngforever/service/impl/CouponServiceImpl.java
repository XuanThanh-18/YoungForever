package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.request.ApplyCouponRequest;
import com.toby.youngforever.dto.response.CouponResponse;
import com.toby.youngforever.entity.Coupon;
import com.toby.youngforever.entity.CouponUsage;
import com.toby.youngforever.entity.Order;
import com.toby.youngforever.enums.DiscountType;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.repository.CouponRepository;
import com.toby.youngforever.repository.CouponUsageRepository;
import com.toby.youngforever.repository.OrderRepository;
import com.toby.youngforever.repository.UserRepository;
import com.toby.youngforever.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    public CouponResponse apply(UUID userId, ApplyCouponRequest request) {
        Coupon coupon = validateAndGetCoupon(request.getCode(), userId, request.getOrderValue());
        BigDecimal discount = calculateDiscount(coupon, request.getOrderValue());

        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(coupon.getMinOrderValue())
                .maxDiscount(coupon.getMaxDiscount())
                .calculatedDiscount(discount)
                .expiresAt(coupon.getExpiresAt())
                .build();
    }

    @Override
    public Coupon validateAndGetCoupon(String code, UUID userId, BigDecimal orderValue) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase().trim())
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        if (!coupon.getIsActive()) {
            throw new AppException(ErrorCode.COUPON_NOT_FOUND);
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            throw new AppException(ErrorCode.COUPON_NOT_FOUND);
        }
        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            throw new AppException(ErrorCode.COUPON_EXPIRED);
        }

        // Global usage limit
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new AppException(ErrorCode.COUPON_USAGE_EXCEEDED);
        }

        // Per-user usage limit
        long userUsageCount = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
        if (userUsageCount >= coupon.getUserLimit()) {
            throw new AppException(ErrorCode.COUPON_USED);
        }

        // Minimum order value
        if (orderValue != null && orderValue.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new AppException(ErrorCode.ORDER_MIN_VALUE);
        }

        return coupon;
    }

    @Override
    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderValue) {
        if (orderValue == null) return BigDecimal.ZERO;

        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderValue
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            // Cap to maxDiscount if set
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        } else {
            // FIXED_AMOUNT — cannot exceed order value
            discount = coupon.getDiscountValue().min(orderValue);
        }

        return discount;
    }

    @Override
    public void recordUsage(UUID couponId, UUID userId, UUID orderId) {
        Coupon coupon = couponRepository.getReferenceById(couponId);
        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .user(userRepository.getReferenceById(userId))
                .order(orderRepository.getReferenceById(orderId))
                .build();
        couponUsageRepository.save(usage);
        couponRepository.incrementUsedCount(couponId);
    }
}