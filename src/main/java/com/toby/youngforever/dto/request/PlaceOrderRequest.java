package com.toby.youngforever.dto.request;

import com.toby.youngforever.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class PlaceOrderRequest {
    @NotNull(message = "Địa chỉ giao hàng không được để trống")
    private UUID addressId;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    private String couponCode;
    private String customerNote;
}
