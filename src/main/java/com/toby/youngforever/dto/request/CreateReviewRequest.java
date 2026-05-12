package com.toby.youngforever.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CreateReviewRequest {
    @NotNull private UUID productId;
    @NotNull private UUID orderItemId;

    @Min(1) @Max(5)
    @NotNull private Short rating;

    @Size(max = 255)
    private String title;

    @Size(max = 2000)
    private String comment;

    private List<String> imageUrls;
}
