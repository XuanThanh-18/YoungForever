package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.dto.response.ProductSummaryResponse;
import com.toby.youngforever.entity.Product;
import com.toby.youngforever.entity.Wishlist;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.mapper.ProductMapper;
import com.toby.youngforever.repository.ProductRepository;
import com.toby.youngforever.repository.UserRepository;
import com.toby.youngforever.repository.WishlistRepository;
import com.toby.youngforever.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> getWishlist(UUID userId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "addedAt"));
        var wishlistPage = wishlistRepository.findByUserId(userId, pageable);

        List<ProductSummaryResponse> products = wishlistPage.getContent()
                .stream()
                .map(w -> productMapper.toSummary(w.getProduct()))
                .toList();

        Page<ProductSummaryResponse> resultPage = new PageImpl<>(
                products, pageable, wishlistPage.getTotalElements());
        return PageResponse.from(resultPage);
    }

    @Override
    public void toggle(UUID userId, UUID productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        } else {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
            Wishlist wishlist = Wishlist.builder()
                    .user(userRepository.getReferenceById(userId))
                    .product(product)
                    .build();
            wishlistRepository.save(wishlist);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWishlisted(UUID userId, UUID productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}