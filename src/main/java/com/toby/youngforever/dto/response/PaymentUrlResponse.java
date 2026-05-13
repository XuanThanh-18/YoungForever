package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PaymentUrlResponse {
    private UUID paymentId;
    private String paymentUrl;   // URL redirect người dùng sang cổng
    private String method;       // VNPAY | MOMO
    private String orderNumber;
}