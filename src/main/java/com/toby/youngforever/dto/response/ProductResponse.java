package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @Builder
public class ProductResponse {
    private UUID id;
    private String name;
    private String slug;
    private String shortDesc;
    private String description;
    private String sku;
    private BigDecimal price;
    private BigDecimal salePrice;
    private BigDecimal effectivePrice;
    private Integer stock;
    private Boolean isActive;
    private Boolean isFeatured;
    private Boolean isBestSeller;
    private Boolean isNewArrival;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private Integer soldCount;
    private String skinType;
    private CategorySummary category;
    private BrandSummary brand;
    private List<ProductImageResponse> images;
    private List<ProductVariantResponse> variants;
    private String primaryImageUrl;
    private LocalDateTime createdAt;
}
