package com.toby.youngforever.mapper;

import com.toby.youngforever.dto.response.OrderItemResponse;
import com.toby.youngforever.dto.response.OrderResponse;
import com.toby.youngforever.entity.Order;
import com.toby.youngforever.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "status", source = "status")
    @Mapping(target = "paymentMethod", source = "paymentMethod")
    OrderResponse toResponse(Order order);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "hasReview", expression = "java(item.getReviewId() != null)")
    OrderItemResponse toItemResponse(OrderItem item);
}
