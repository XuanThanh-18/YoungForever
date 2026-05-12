package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.request.CreateProductRequest;
import com.toby.youngforever.dto.request.ProductFilterRequest;
import com.toby.youngforever.dto.request.UpdateProductRequest;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.dto.response.ProductResponse;
import com.toby.youngforever.dto.response.ProductSummaryResponse;
import com.toby.youngforever.entity.Product;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.exception.ResourceNotFoundException;
import com.toby.youngforever.mapper.ProductMapper;
import com.toby.youngforever.repository.BrandRepository;
import com.toby.youngforever.repository.CategoryRepository;
import com.toby.youngforever.repository.ProductRepository;
import com.toby.youngforever.service.ProductService;
import com.toby.youngforever.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductMapper productMapper;

    @Override
    public PageResponse<ProductSummaryResponse> filterProducts(ProductFilterRequest filter) {
        Specification<Product> spec = buildSpecification(filter);

        Sort sort = buildSort(filter.getSortBy(), filter.getSortDir());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(productMapper::toSummary));
    }

    @Cacheable(value = "products", key = "#slug")
    @Override
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm " + slug));

        // Async increment view count
        productRepository.incrementViewCount(product.getId());

        return productMapper.toResponse(product);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    @Override
    public ProductResponse create(CreateProductRequest request) {
        String slug = generateUniqueSlug(request.getName(), null);

        Product product = productMapper.toEntity(request);
        product.setSlug(slug);
        product.setCategory(categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND)));

        if (request.getBrandId() != null) {
            product.setBrand(brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND)));
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    @Override
    public ProductResponse update(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productMapper.updateFromRequest(request, product);

        if (request.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND)));
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    @Override
    public void softDelete(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setDeletedAt(java.time.LocalDateTime.now());
        product.setIsActive(false);
        productRepository.save(product);
    }

}
