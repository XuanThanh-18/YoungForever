package com.toby.youngforever.mapper;

import com.toby.youngforever.dto.request.CreateProductRequest;
import com.toby.youngforever.dto.request.UpdateProductRequest;
import com.toby.youngforever.dto.response.*;
import com.toby.youngforever.entity.Product;
import com.toby.youngforever.entity.ProductImage;
import com.toby.youngforever.entity.ProductVariant;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "avgRating", ignore = true)
    @Mapping(target = "reviewCount", ignore = true)
    @Mapping(target = "soldCount", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Product toEntity(CreateProductRequest request);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromRequest(UpdateProductRequest request, @MappingTarget Product product);

    @Mapping(target = "category", source = "category", qualifiedByName = "toCategorySummary")
    @Mapping(target = "brand", source = "brand", qualifiedByName = "toBrandSummary")
    @Mapping(target = "primaryImageUrl", expression = "java(getPrimaryImageUrl(product))")
    @Mapping(target = "effectivePrice", expression = "java(product.getEffectivePrice())")
    ProductResponse toResponse(Product product);

    @Mapping(target = "category", source = "category", qualifiedByName = "toCategorySummary")
    @Mapping(target = "brand", source = "brand", qualifiedByName = "toBrandSummary")
    @Mapping(target = "primaryImageUrl", expression = "java(getPrimaryImageUrl(product))")
    @Mapping(target = "effectivePrice", expression = "java(product.getEffectivePrice())")
    ProductSummaryResponse toSummary(Product product);

    @Named("toCategorySummary")
    default CategorySummary toCategorySummary(com.toby.youngforever.entity.Category c) {
        if (c == null) return null;
        return CategorySummary.builder()
                .id(c.getId()).name(c.getName()).slug(c.getSlug()).build();
    }

    @Named("toBrandSummary")
    default BrandSummary toBrandSummary(com.toby.youngforever.entity.Brand b) {
        if (b == null) return null;
        return BrandSummary.builder()
                .id(b.getId()).name(b.getName())
                .slug(b.getSlug()).logoUrl(b.getLogoUrl()).build();
    }

    default String getPrimaryImageUrl(Product p) {
        if (p.getImages() == null || p.getImages().isEmpty()) return null;
        return p.getImages().stream()
                .filter(ProductImage::getIsPrimary).findFirst()
                .or(() -> p.getImages().stream().findFirst())
                .map(ProductImage::getUrl).orElse(null);
    }

    ProductImageResponse toImageResponse(ProductImage image);
    ProductVariantResponse toVariantResponse(ProductVariant variant);
    List<ProductImageResponse> toImageResponseList(List<ProductImage> images);
    List<ProductVariantResponse> toVariantResponseList(List<ProductVariant> variants);
}
