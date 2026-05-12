package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data @Builder
public class ProductSummaryResponse {
    private UUID id;
    private String name;
    private String slug;
    private BigDecimal price;
    private BigDecimal salePrice;
    private BigDecimal effectivePrice;
    private String primaryImageUrl;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private Boolean isBestSeller;
    private Boolean isNewArrival;
    private CategorySummary category;
    private BrandSummary brand;
}
