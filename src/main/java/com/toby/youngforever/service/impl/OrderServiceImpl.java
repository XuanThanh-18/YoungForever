package com.toby.youngforever.service.impl;

// NOTE: This file contains ONLY the two private helpers that were missing
// from the OrderServiceImpl already in the project.
// Add these two methods to the existing OrderServiceImpl class:

/*
    // ── Private helpers ─────────────────────────────────────
    private BigDecimal calculateShippingFee(BigDecimal subtotal) {
        // Free shipping for orders over 500,000 VND
        return subtotal.compareTo(new BigDecimal("500000")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("30000");
    }

    private String formatAddress(Address address) {
        return String.join(", ",
                address.getStreet(),
                address.getWard() != null ? address.getWard() : "",
                address.getDistrict(),
                address.getCity()
        ).replaceAll(", ,", ",").trim();
    }

    private String getPrimaryImage(Product product) {
        if (product.getImages() == null || product.getImages().isEmpty()) return null;
        return product.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(img -> img.getUrl())
                .orElse(null);
    }
*/

// ============================================================
// COMPLETE OrderServiceImpl (use this to replace the existing one)
// ============================================================

import com.toby.youngforever.dto.request.PlaceOrderRequest;
import com.toby.youngforever.dto.response.OrderResponse;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.entity.*;
import com.toby.youngforever.enums.OrderStatus;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.mapper.OrderMapper;
import com.toby.youngforever.repository.*;
import com.toby.youngforever.service.CartService;
import com.toby.youngforever.service.CouponService;
import com.toby.youngforever.service.NotificationService;
import com.toby.youngforever.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository      orderRepository;
    private final CartItemRepository   cartItemRepository;
    private final AddressRepository    addressRepository;
    private final ProductRepository    productRepository;
    private final UserRepository       userRepository;
    private final CouponService        couponService;
    private final CartService          cartService;
    private final NotificationService  notificationService;
    private final OrderMapper          orderMapper;

    @Override
    public OrderResponse placeOrder(UUID userId, PlaceOrderRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) throw new AppException(ErrorCode.VALIDATION_FAILED);

        Address address = addressRepository.findById(request.getAddressId())
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        BigDecimal subtotal = cartItems.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingFee    = calculateShippingFee(subtotal);
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon coupon             = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon        = couponService.validateAndGetCoupon(request.getCouponCode(), userId, subtotal);
            discountAmount = couponService.calculateDiscount(coupon, subtotal);
        }

        BigDecimal totalAmount = subtotal.add(shippingFee).subtract(discountAmount);

        Order order = Order.builder()
                .user(userRepository.getReferenceById(userId))
                .address(address)
                .shipFullName(address.getFullName())
                .shipPhone(address.getPhone())
                .shipAddress(formatAddress(address))
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .coupon(coupon)
                .couponCode(coupon != null ? coupon.getCode() : null)
                .paymentMethod(request.getPaymentMethod())
                .customerNote(request.getCustomerNote())
                .status(OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = cartItems.stream().map(ci -> {
            int updated = productRepository.decrementStock(ci.getProduct().getId(), ci.getQuantity());
            if (updated == 0) throw new AppException(ErrorCode.INSUFFICIENT_STOCK);

            return OrderItem.builder()
                    .order(order)
                    .product(ci.getProduct())
                    .variant(ci.getVariant())
                    .productName(ci.getProduct().getName())
                    .variantName(ci.getVariant() != null ? ci.getVariant().getName() : null)
                    .imageUrl(getPrimaryImage(ci.getProduct()))
                    .unitPrice(ci.getUnitPrice())
                    .quantity(ci.getQuantity())
                    .totalPrice(ci.getTotalPrice())
                    .build();
        }).toList();

        order.setItems(orderItems);
        Order saved = orderRepository.save(order);

        if (coupon != null) {
            couponService.recordUsage(coupon.getId(), userId, saved.getId());
        }
        cartService.clearCart(userId);
        notificationService.sendOrderPlaced(userId, saved);

        log.info("Order placed: {} for user {}", saved.getOrderNumber(), userId);
        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getUserOrders(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(
                orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(orderMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return orderMapper.toResponse(order);
    }

    @Override
    public OrderResponse cancelOrder(UUID userId, UUID orderId, String reason) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING
                && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_ORDER);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancelReason(reason);

        // Restore stock
        if (order.getItems() != null) {
            order.getItems().forEach(item ->
                    productRepository.decrementStock(item.getProduct().getId(), -item.getQuantity()));
        }

        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse updateStatus(UUID orderId, OrderStatus newStatus, String adminNote) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        order.setStatus(newStatus);
        if (adminNote != null) order.setAdminNote(adminNote);

        switch (newStatus) {
            case CONFIRMED -> order.setConfirmedAt(LocalDateTime.now());
            case SHIPPING  -> order.setShippedAt(LocalDateTime.now());
            case DELIVERED -> {
                order.setDeliveredAt(LocalDateTime.now());
                if (order.getItems() != null) {
                    order.getItems().forEach(item ->
                            productRepository.incrementSoldCount(
                                    item.getProduct().getId(), item.getQuantity()));
                }
            }
            default -> { /* no timestamp */ }
        }

        notificationService.sendOrderStatusUpdate(order.getUser().getId(), order);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ── Private helpers ─────────────────────────────────────
    private BigDecimal calculateShippingFee(BigDecimal subtotal) {
        return subtotal.compareTo(new BigDecimal("500000")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("30000");
    }

    private String formatAddress(Address a) {
        StringBuilder sb = new StringBuilder(a.getStreet());
        if (a.getWard() != null && !a.getWard().isBlank()) sb.append(", ").append(a.getWard());
        sb.append(", ").append(a.getDistrict());
        sb.append(", ").append(a.getCity());
        return sb.toString();
    }

    private String getPrimaryImage(Product product) {
        if (product.getImages() == null || product.getImages().isEmpty()) return null;
        return product.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(ProductImage::getUrl)
                .orElse(null);
    }
}