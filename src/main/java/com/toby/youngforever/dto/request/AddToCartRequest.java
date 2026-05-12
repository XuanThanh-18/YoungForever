package com.toby.youngforever.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class AddToCartRequest {
    @NotNull private UUID productId;
    private UUID variantId;

    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    private Integer quantity = 1;
}
