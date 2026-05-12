package com.toby.youngforever.mapper;

import com.toby.youngforever.dto.response.CartItemResponse;
import com.toby.youngforever.entity.CartItem;
import com.toby.youngforever.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productSlug", source = "product.slug")
    @Mapping(target = "variantId", source = "variant.id")
    @Mapping(target = "variantName", source = "variant.name")
    @Mapping(target = "imageUrl", expression = "java(getPrimaryImage(item))")
    @Mapping(target = "availableStock", source = "product.stock")
    @Mapping(target = "totalPrice", expression = "java(item.getTotalPrice())")
    CartItemResponse toResponse(CartItem item);

    default String getPrimaryImage(CartItem item) {
        if (item.getProduct().getImages() == null || item.getProduct().getImages().isEmpty()) return null;
        return item.getProduct().getImages().stream()
                .filter(ProductImage::getIsPrimary).findFirst()
                .or(() -> item.getProduct().getImages().stream().findFirst())
                .map(ProductImage::getUrl).orElse(null);
    }
}
