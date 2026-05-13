package com.toby.youngforever.service;

import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.dto.response.ProductSummaryResponse;

import java.util.UUID;

public interface WishlistService {
    PageResponse<ProductSummaryResponse> getWishlist(UUID userId, int page, int size);
    void toggle(UUID userId, UUID productId);
    boolean isWishlisted(UUID userId, UUID productId);
}