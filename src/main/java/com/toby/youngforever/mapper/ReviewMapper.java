package com.toby.youngforever.mapper;

import com.toby.youngforever.dto.response.ReviewResponse;
import com.toby.youngforever.entity.Review;
import com.toby.youngforever.entity.ReviewImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "authorName", source = "user.fullName")
    @Mapping(target = "authorAvatar", source = "user.avatarUrl")
    @Mapping(target = "images", expression = "java(extractImageUrls(review))")
    ReviewResponse toResponse(Review review);

    default List<String> extractImageUrls(Review review) {
        if (review.getImages() == null) return List.of();
        return review.getImages().stream()
                .map(ReviewImage::getUrl)
                .collect(Collectors.toList());
    }
}
