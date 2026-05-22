package com.toby.youngforever.repository;


import com.toby.youngforever.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {}
