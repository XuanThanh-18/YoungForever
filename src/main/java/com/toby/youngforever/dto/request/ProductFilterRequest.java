package com.toby.youngforever.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductFilterRequest {
    private String keyword;
    private UUID categoryId;
    private UUID brandId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Short minRating;
    private String skinType;
    private Boolean isFeatured;
    private Boolean isNewArrival;
    private Boolean isBestSeller;
    private Boolean inStock;

    // Pagination & Sort
    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";      // price, avgRating, soldCount, createdAt
    private String sortDir = "desc";          // asc / desc
}
