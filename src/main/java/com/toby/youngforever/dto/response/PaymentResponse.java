package com.toby.youngforever.dto.response;

import com.toby.youngforever.enums.PaymentMethod;
import com.toby.youngforever.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private UUID id;
    private UUID orderId;
    private String orderNumber;
    private PaymentMethod method;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;
    private String transactionId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}