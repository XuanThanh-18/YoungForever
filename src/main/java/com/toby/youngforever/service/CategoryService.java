// ── CategoryService ───────────────────────────────────────
package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.CreateCategoryRequest;
import com.toby.youngforever.dto.response.CategoryResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<CategoryResponse> getRootCategories();
    CategoryResponse getBySlug(String slug);
    CategoryResponse create(CreateCategoryRequest request);
    CategoryResponse update(UUID id, CreateCategoryRequest request);
    void softDelete(UUID id);
}