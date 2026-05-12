package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class ProductImageResponse {
    private UUID id;
    private String url;
    private String altText;
    private Integer sortOrder;
    private Boolean isPrimary;
}
