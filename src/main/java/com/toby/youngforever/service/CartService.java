package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.AddToCartRequest;
import com.toby.youngforever.dto.response.CartResponse;

import java.util.UUID;

public interface CartService {
    CartResponse getCart(UUID userId);

    CartResponse addItem(UUID userId, AddToCartRequest request);

    CartResponse updateItemQuantity(UUID userId, UUID itemId, int quantity);

    void removeItem(UUID userId, UUID itemId);

    void clearCart(UUID userId);
}
