package com.toby.youngforever.service.impl;

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
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;
    private final CartService cartService;
    private final NotificationService notificationService;
    private final OrderMapper orderMapper;

    @Override
    public OrderResponse placeOrder(UUID userId, PlaceOrderRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) throw new AppException(ErrorCode.VALIDATION_FAILED);

        Address address = addressRepository.findById(request.getAddressId())
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        // Calculate subtotal
        BigDecimal subtotal = cartItems.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingFee = calculateShippingFee(subtotal);
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon coupon = null;

        // Apply coupon if provided
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponService.validateAndGetCoupon(request.getCouponCode(), userId, subtotal);
            discountAmount = couponService.calculateDiscount(coupon, subtotal);
        }

        BigDecimal totalAmount = subtotal.add(shippingFee).subtract(discountAmount);

        // Build order
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

        // Build order items and decrement stock
        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            int updated = productRepository.decrementStock(
                    cartItem.getProduct().getId(), cartItem.getQuantity());
            if (updated == 0) throw new AppException(ErrorCode.INSUFFICIENT_STOCK);

            return OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .variant(cartItem.getVariant())
                    .productName(cartItem.getProduct().getName())
                    .variantName(cartItem.getVariant() != null ? cartItem.getVariant().getName() : null)
                    .imageUrl(getPrimaryImage(cartItem.getProduct()))
                    .unitPrice(cartItem.getUnitPrice())
                    .quantity(cartItem.getQuantity())
                    .totalPrice(cartItem.getTotalPrice())
                    .build();
        }).toList();

        order.setItems(orderItems);
        Order saved = orderRepository.save(order);

        // Record coupon usage
        if (coupon != null) {
            couponService.recordUsage(coupon.getId(), userId, saved.getId());
        }

        // Clear cart
        cartService.clearCart(userId);

        // Send notification
        notificationService.sendOrderPlaced(userId, saved);

        log.info("Order placed: {} for user {}", saved.getOrderNumber(), userId);
        return orderMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponse<OrderResponse> getUserOrders(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.from(orders.map(orderMapper::toResponse));
    }

    @Transactional(readOnly = true)
    @Override
    public OrderResponse getOrderDetail(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return orderMapper.toResponse(order);
    }

    @Override
    public OrderResponse cancelOrder(UUID userId, UUID orderId, String reason) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getStatus().equals(OrderStatus.PENDING)
                && !order.getStatus().equals(OrderStatus.CONFIRMED)) {
            throw new AppException(ErrorCode.CANNOT_CANCEL_ORDER);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(java.time.LocalDateTime.now());
        order.setCancelReason(reason);

        // Restore stock
        order.getItems().forEach(item ->
                productRepository.decrementStock(item.getProduct().getId(), -item.getQuantity()));

        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ── Admin ─────────────────────────────────────────────
    @Override
    public OrderResponse updateStatus(UUID orderId, OrderStatus newStatus, String adminNote) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        order.setStatus(newStatus);
        if (adminNote != null) order.setAdminNote(adminNote);

        switch (newStatus) {
            case CONFIRMED -> order.setConfirmedAt(java.time.LocalDateTime.now());
            case SHIPPING  -> order.setShippedAt(java.time.LocalDateTime.now());
            case DELIVERED -> {
                order.setDeliveredAt(java.time.LocalDateTime.now());
                // Increment sold count for all items
                order.getItems().forEach(item ->
                        productRepository.incrementSoldCount(item.getProduct().getId(), item.getQuantity()));
            }
            default -> {}
        }

        notificationService.sendOrderStatusUpdate(order.getUser().getId(), order);
        return orderMapper.toResponse(orderRepository.save(order));
    }

}