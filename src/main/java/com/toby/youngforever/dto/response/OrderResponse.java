package com.toby.youngforever.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private String orderNumber;        // ← ensure this field exists
    private String status;
    private String paymentMethod;      // ← ensure this field exists
    private String shippingName;       // ← was shipFullName → rename to shippingName
    private String shippingPhone;      // ← was shipPhone
    private String shippingAddress;    // ← was shipAddress

    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;

    private List<OrderItemResponse> items;  // ← ensure list is included

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deliveredAt;
}