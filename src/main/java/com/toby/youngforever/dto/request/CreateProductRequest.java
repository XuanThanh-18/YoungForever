package com.toby.youngforever.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255)
    private String name;

    private String description;
    private String shortDesc;
    private String sku;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    private BigDecimal salePrice;

    @NotNull @Min(0)
    private Integer stock;

    @NotNull(message = "Danh mục không được để trống")
    private UUID categoryId;

    private UUID brandId;
    private Integer weightGram;
    private Integer volumeMl;
    private String ingredients;
    private String howToUse;
    private String skinType;
    private Boolean isFeatured = false;
    private Boolean isNewArrival = false;
    private String metaTitle;
    private String metaDesc;
}
