package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.request.CreateBrandRequest;
import com.toby.youngforever.dto.response.BrandResponse;
import com.toby.youngforever.entity.Brand;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.repository.BrandRepository;
import com.toby.youngforever.service.BrandService;
import com.toby.youngforever.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    @Override
    public List<BrandResponse> getAllActive() {
        return brandRepository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(this::toResponse).toList();
    }

    @Override
    public BrandResponse getBySlug(String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return toResponse(brand);
    }

    @Override
    @Transactional
    public BrandResponse create(CreateBrandRequest request) {
        String slug = generateUniqueSlug(request.getName());
        Brand brand = Brand.builder()
                .name(request.getName())
                .slug(slug)
                .logoUrl(request.getLogoUrl())
                .bannerUrl(request.getBannerUrl())
                .description(request.getDescription())
                .country(request.getCountry())
                .website(request.getWebsite())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(true)
                .build();
        return toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse update(UUID id, CreateBrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (request.getName() != null && !request.getName().equals(brand.getName())) {
            brand.setName(request.getName());
            brand.setSlug(generateUniqueSlug(request.getName()));
        }
        if (request.getLogoUrl() != null)    brand.setLogoUrl(request.getLogoUrl());
        if (request.getBannerUrl() != null)  brand.setBannerUrl(request.getBannerUrl());
        if (request.getDescription() != null) brand.setDescription(request.getDescription());
        if (request.getCountry() != null)    brand.setCountry(request.getCountry());
        if (request.getWebsite() != null)    brand.setWebsite(request.getWebsite());
        if (request.getSortOrder() != null)  brand.setSortOrder(request.getSortOrder());

        return toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void softDelete(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        brand.setDeletedAt(LocalDateTime.now());
        brand.setIsActive(false);
        brandRepository.save(brand);
    }

    // ── Helpers ─────────────────────────────────────────────
    private BrandResponse toResponse(Brand b) {
        return BrandResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .slug(b.getSlug())
                .logoUrl(b.getLogoUrl())
                .bannerUrl(b.getBannerUrl())
                .description(b.getDescription())
                .country(b.getCountry())
                .website(b.getWebsite())
                .isActive(b.getIsActive())
                .build();
    }

    private String generateUniqueSlug(String name) {
        String base = SlugUtils.slugify(name);
        String slug = base;
        int suffix = 1;
        while (brandRepository.existsBySlug(slug)) {
            slug = base + "-" + suffix++;
        }
        return slug;
    }
}