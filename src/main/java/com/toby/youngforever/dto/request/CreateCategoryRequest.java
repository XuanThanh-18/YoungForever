package com.toby.youngforever.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.UUID;

@Data
public class CreateCategoryRequest {
    @NotBlank @Size(max = 100)
    private String name;
    private String description;
    private String imageUrl;
    private UUID parentId;
    private Integer sortOrder = 0;
}
