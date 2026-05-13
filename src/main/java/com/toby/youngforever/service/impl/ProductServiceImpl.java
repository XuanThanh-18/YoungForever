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
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    @Override
    @Cacheable(value = "products", key = "#slug")
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm " + slug));
        // Increment view count without breaking cache read
        productRepository.incrementViewCount(product.getId());
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
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

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse update(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Regenerate slug if name changed
        if (request.getName() != null && !request.getName().equals(product.getName())) {
            product.setSlug(generateUniqueSlug(request.getName(), id));
        }

        productMapper.updateFromRequest(request, product);

        if (request.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND)));
        }
        if (request.getBrandId() != null) {
            product.setBrand(brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND)));
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void softDelete(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setDeletedAt(LocalDateTime.now());
        product.setIsActive(false);
        productRepository.save(product);
    }

    // ── Specification builder ────────────────────────────────
    private Specification<Product> buildSpecification(ProductFilterRequest f) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("isActive")));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (f.getKeyword() != null && !f.getKeyword().isBlank()) {
                String like = "%" + f.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("shortDesc")), like)
                ));
            }
            if (f.getCategoryId() != null)
                predicates.add(cb.equal(root.get("category").get("id"), f.getCategoryId()));
            if (f.getBrandId() != null)
                predicates.add(cb.equal(root.get("brand").get("id"), f.getBrandId()));
            if (f.getMinPrice() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), f.getMinPrice()));
            if (f.getMaxPrice() != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), f.getMaxPrice()));
            if (f.getMinRating() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("avgRating"),
                        new java.math.BigDecimal(f.getMinRating())));
            if (f.getSkinType() != null && !f.getSkinType().isBlank())
                predicates.add(cb.like(root.get("skinType"), "%" + f.getSkinType() + "%"));
            if (Boolean.TRUE.equals(f.getIsFeatured()))
                predicates.add(cb.isTrue(root.get("isFeatured")));
            if (Boolean.TRUE.equals(f.getIsNewArrival()))
                predicates.add(cb.isTrue(root.get("isNewArrival")));
            if (Boolean.TRUE.equals(f.getIsBestSeller()))
                predicates.add(cb.isTrue(root.get("isBestSeller")));
            if (Boolean.TRUE.equals(f.getInStock()))
                predicates.add(cb.greaterThan(root.get("stock"), 0));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort buildSort(String sortBy, String sortDir) {
        String field = switch (sortBy == null ? "createdAt" : sortBy) {
            case "price"  -> "price";
            case "rating" -> "avgRating";
            case "sold"   -> "soldCount";
            default       -> "createdAt";
        };
        return "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(Sort.Direction.ASC, field)
                : Sort.by(Sort.Direction.DESC, field);
    }

    private String generateUniqueSlug(String name, UUID existingId) {
        String base = SlugUtils.slugify(name);
        String slug = base;
        int suffix = 1;
        while (true) {
            var existing = productRepository.findBySlug(slug);
            // No conflict, or conflict is with the same entity being updated
            if (existing.isEmpty()
                    || (existingId != null && existing.get().getId().equals(existingId))) {
                break;
            }
            slug = base + "-" + (suffix++);
        }
        return slug;
    }
}