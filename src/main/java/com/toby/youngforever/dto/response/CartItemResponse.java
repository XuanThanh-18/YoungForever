package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data @Builder
public class CartItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private String productSlug;
    private UUID variantId;
    private String variantName;
    private String imageUrl;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;
    private Integer availableStock;
}
