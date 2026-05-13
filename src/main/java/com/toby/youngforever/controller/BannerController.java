// ── BannerController ─────────────────────────────────────────
package com.toby.youngforever.controller;

import com.toby.youngforever.dto.response.ApiResponse;
import com.toby.youngforever.dto.response.BannerResponse;
import com.toby.youngforever.entity.Banner;
import com.toby.youngforever.repository.BannerRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/banners")
@RequiredArgsConstructor
@Tag(name = "Banners", description = "Banner quảng cáo")
public class BannerController {

    private final BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getActiveBanners(
            @RequestParam(defaultValue = "HOME_HERO") String position) {
        List<BannerResponse> banners = bannerRepository.findActiveByPosition(position)
                .stream().map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(banners));
    }

    private BannerResponse toResponse(Banner b) {
        return BannerResponse.builder()
                .id(b.getId())
                .title(b.getTitle())
                .subtitle(b.getSubtitle())
                .imageUrl(b.getImageUrl())
                .linkUrl(b.getLinkUrl())
                .position(b.getPosition())
                .sortOrder(b.getSortOrder())
                .isActive(b.getIsActive())
                .startsAt(b.getStartsAt())
                .expiresAt(b.getExpiresAt())
                .build();
    }
}