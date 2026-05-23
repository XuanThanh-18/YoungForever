package com.toby.youngforever.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryResponse {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Integer sortOrder;          // ← ADD
    private Boolean isActive;           // ← ADD
    private CategorySummary parent;     // ← ADD
    private List<CategoryResponse> children;
}
