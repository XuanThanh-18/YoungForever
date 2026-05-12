package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class BrandResponse {
    private UUID id;
    private String name;
    private String slug;
    private String logoUrl;
    private String bannerUrl;
    private String description;
    private String country;
    private String website;
    private Boolean isActive;
}
