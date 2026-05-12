package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.request.AddToCartRequest;
import com.toby.youngforever.dto.response.*;
import com.toby.youngforever.entity.*;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.mapper.CartMapper;
import com.toby.youngforever.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements com.toby.youngforever.service.CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Override
    public CartResponse getCart(UUID userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        return buildCartResponse(items);
    }

    @Override
    public CartResponse addItem(UUID userId, AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (!product.getIsActive()) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        if (product.getStock() <= 0) throw new AppException(ErrorCode.OUT_OF_STOCK);

        // Compute effective price
        BigDecimal price = product.getEffectivePrice();
        if (request.getVariantId() != null) {
            price = product.getVariants().stream()
                    .filter(v -> v.getId().equals(request.getVariantId()))
                    .findFirst()
                    .map(v -> v.getSalePrice() != null ? v.getSalePrice() : v.getPrice() != null ? v.getPrice() : product.getEffectivePrice())
                    .orElse(price);
        }

        final BigDecimal finalPrice = price;
        // Upsert: if item exists, increase quantity
        CartItem item = cartItemRepository
                .findByUserProductVariant(userId, request.getProductId(), request.getVariantId())
                .map(existing -> {
                    int newQty = existing.getQuantity() + request.getQuantity();
                    if (newQty > product.getStock()) throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
                    existing.setQuantity(newQty);
                    existing.setUnitPrice(finalPrice);
                    return existing;
                })
                .orElseGet(() -> CartItem.builder()
                        .user(userRepository.getReferenceById(userId))
                        .product(product)
                        .quantity(request.getQuantity())
                        .unitPrice(finalPrice)
                        .build());

        cartItemRepository.save(item);
        return getCart(userId);
    }

    @Override
    public CartResponse updateItemQuantity(UUID userId, UUID itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (!item.getUser().getId().equals(userId))
            throw new AppException(ErrorCode.NOT_FOUND);

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (quantity > item.getProduct().getStock())
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCart(userId);
    }

    @Override
    public void removeItem(UUID userId, UUID itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (!item.getUser().getId().equals(userId))
            throw new AppException(ErrorCode.NOT_FOUND);
        cartItemRepository.delete(item);
    }

    @Override
    public void clearCart(UUID userId) {
        cartItemRepository.clearCart(userId);
    }

    private CartResponse buildCartResponse(List<CartItem> items) {
        BigDecimal total = items.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(items.stream().map(cartMapper::toResponse).toList())
                .totalItems(items.stream().mapToInt(CartItem::getQuantity).sum())
                .totalAmount(total)
                .build();
    }
}

