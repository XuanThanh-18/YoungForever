package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.request.CreateCategoryRequest;
import com.toby.youngforever.dto.response.CategoryResponse;
import com.toby.youngforever.dto.response.CategorySummary;
import com.toby.youngforever.entity.Category;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.repository.CategoryRepository;
import com.toby.youngforever.service.CategoryService;
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
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNullAndIsActiveTrue()
                .stream().map(this::toResponse).toList();
    }

    @Override
    public CategoryResponse getBySlug(String slug) {
        Category cat = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return toResponse(cat);
    }

    @Override
    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        String slug = generateUniqueSlug(request.getName());
        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(true)
                .build();

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            category.setParent(parent);
        }

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(UUID id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            category.setName(request.getName());
            category.setSlug(generateUniqueSlug(request.getName()));
        }
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getImageUrl() != null)    category.setImageUrl(request.getImageUrl());
        if (request.getSortOrder() != null)   category.setSortOrder(request.getSortOrder());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            category.setParent(parent);
        }

        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void softDelete(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        category.setDeletedAt(LocalDateTime.now());
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    // ── Helpers ─────────────────────────────────────────────
    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .sortOrder(c.getSortOrder())
                .isActive(c.getIsActive())
                .parent(c.getParent() != null ? toSummary(c.getParent()) : null)
                .children(c.getChildren() != null
                        ? c.getChildren().stream().map(this::toSummary).toList()
                        : List.of())
                .build();
    }

    private CategorySummary toSummary(Category c) {
        return CategorySummary.builder()
                .id(c.getId()).name(c.getName()).slug(c.getSlug()).build();
    }

    private String generateUniqueSlug(String name) {
        String base = SlugUtils.slugify(name);
        String slug = base;
        int suffix = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = base + "-" + suffix++;
        }
        return slug;
    }
}