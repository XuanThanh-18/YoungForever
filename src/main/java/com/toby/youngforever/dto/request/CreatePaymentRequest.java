package com.toby.youngforever.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreatePaymentRequest {

    @NotNull(message = "ID đơn hàng không được để trống")
    private UUID orderId;

    /** Ngôn ngữ trang VNPay: vn / en */
    private String locale = "vn";

    /** URL frontend để redirect sau thanh toán */
    private String returnUrl;
}