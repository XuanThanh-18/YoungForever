package com.toby.youngforever.controller;

import com.toby.youngforever.dto.response.*;
import com.toby.youngforever.security.UserDetailsImpl;
import com.toby.youngforever.service.WishlistService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Wishlist", description = "Danh sách yêu thích")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> getWishlist(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                wishlistService.getWishlist(user.getId(), page, size)));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable UUID productId) {
        wishlistService.toggle(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<ApiResponse<Boolean>> checkWishlist(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable UUID productId) {
        return ResponseEntity.ok(ApiResponse.success(
                wishlistService.isWishlisted(user.getId(), productId)));
    }
}
