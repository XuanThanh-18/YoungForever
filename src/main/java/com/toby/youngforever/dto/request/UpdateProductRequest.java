package com.toby.youngforever.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class UpdateProductRequest {
    @Size(max = 255)
    private String name;
    private String description;
    private String shortDesc;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;
    private BigDecimal salePrice;

    @Min(0)
    private Integer stock;
    private UUID categoryId;
    private UUID brandId;
    private String ingredients;
    private String howToUse;
    private String skinType;
    private Boolean isActive;
    private Boolean isFeatured;
    private Boolean isBestSeller;
    private Boolean isNewArrival;
    private String metaTitle;
    private String metaDesc;
}
