package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class BrandSummary {
    private UUID id;
    private String name;
    private String slug;
    private String logoUrl;
}
