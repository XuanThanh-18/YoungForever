package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.CreateReviewRequest;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.dto.response.ReviewResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface ReviewService {
    ReviewResponse create(UUID userId, CreateReviewRequest request);

    @Transactional(readOnly = true)
    PageResponse<ReviewResponse> getProductReviews(UUID productId, int page, int size);
}
