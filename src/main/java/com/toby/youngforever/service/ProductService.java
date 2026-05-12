package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.CreateProductRequest;
import com.toby.youngforever.dto.request.ProductFilterRequest;
import com.toby.youngforever.dto.request.UpdateProductRequest;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.dto.response.ProductResponse;
import com.toby.youngforever.dto.response.ProductSummaryResponse;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface ProductService {
    PageResponse<ProductSummaryResponse> filterProducts(ProductFilterRequest filter);

    @Cacheable(value = "products", key = "#slug")
    ProductResponse getBySlug(String slug);

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    ProductResponse create(CreateProductRequest request);

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    ProductResponse update(UUID id, UpdateProductRequest request);

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    void softDelete(UUID id);
}
