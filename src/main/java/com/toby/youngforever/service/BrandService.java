package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.CreateBrandRequest;
import com.toby.youngforever.dto.response.BrandResponse;

import java.util.List;
import java.util.UUID;

public interface BrandService {
    List<BrandResponse> getAllActive();
    BrandResponse getBySlug(String slug);
    BrandResponse create(CreateBrandRequest request);
    BrandResponse update(UUID id, CreateBrandRequest request);
    void softDelete(UUID id);
}