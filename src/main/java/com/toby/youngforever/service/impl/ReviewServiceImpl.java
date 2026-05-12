package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.request.CreateReviewRequest;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.dto.response.ReviewResponse;
import com.toby.youngforever.entity.Review;
import com.toby.youngforever.entity.ReviewImage;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.mapper.ReviewMapper;
import com.toby.youngforever.repository.*;
import com.toby.youngforever.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse create(UUID userId, CreateReviewRequest request) {
        if (reviewRepository.existsByUserIdAndOrderItemId(userId, request.getOrderItemId())) {
            throw new AppException(ErrorCode.ALREADY_REVIEWED);
        }

        var product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Review review = Review.builder()
                .product(product)
                .user(userRepository.getReferenceById(userId))
                .orderItemId(request.getOrderItemId())
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .isVerified(true) // linked to order item
                .build();

        if (request.getImageUrls() != null) {
            var images = request.getImageUrls().stream()
                    .map(url -> ReviewImage.builder().review(review).url(url).build())
                    .toList();
            review.setImages(images);
        }

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponse<ReviewResponse> getProductReviews(UUID productId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var reviews = reviewRepository.findByProductIdAndIsHiddenFalse(productId, pageable);
        return PageResponse.from(reviews.map(reviewMapper::toResponse));
    }
}
