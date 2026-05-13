package com.toby.youngforever.controller;

import com.toby.youngforever.dto.request.CreatePaymentRequest;
import com.toby.youngforever.dto.response.ApiResponse;
import com.toby.youngforever.dto.response.PaymentResponse;
import com.toby.youngforever.dto.response.PaymentUrlResponse;
import com.toby.youngforever.security.UserDetailsImpl;
import com.toby.youngforever.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Cổng thanh toán VNPay & MoMo")
public class PaymentController {

    private final PaymentService paymentService;

    // ── VNPay ────────────────────────────────────────────────

    @PostMapping("/vnpay/create")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Tạo URL thanh toán VNPay")
    public ResponseEntity<ApiResponse<PaymentUrlResponse>> createVnpayPayment(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = getClientIp(httpRequest);
        PaymentUrlResponse response = paymentService.createVnpayPayment(
                user.getId(), request, ipAddress);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * IPN endpoint – VNPay gọi server-to-server để thông báo kết quả.
     * KHÔNG yêu cầu JWT (VNPay server gọi, không có token).
     * Phải trả về JSON {"RspCode":"00","Message":"Confirm Success"} nếu OK.
     */
    @GetMapping("/vnpay/ipn")
    @Operation(summary = "VNPay IPN callback (server-to-server, không cần auth)")
    public ResponseEntity<String> vnpayIpn(@RequestParam Map<String, String> params) {
        String result = paymentService.handleVnpayIpn(params);
        return ResponseEntity.ok(result);
    }

    /**
     * Return URL – trình duyệt người dùng được VNPay redirect về sau khi thanh toán.
     * Frontend sẽ đọc query params từ URL này để hiện kết quả,
     * hoặc gọi endpoint này để lấy trạng thái xác thực.
     */
    @GetMapping("/vnpay/return")
    @Operation(summary = "VNPay return URL (trình duyệt redirect về)")
    public ResponseEntity<ApiResponse<PaymentResponse>> vnpayReturn(
            @RequestParam Map<String, String> params) {
        PaymentResponse response = paymentService.handleVnpayReturn(params);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── MoMo ────────────────────────────────────────────────

    @PostMapping("/momo/create")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Tạo URL thanh toán MoMo")
    public ResponseEntity<ApiResponse<PaymentUrlResponse>> createMomoPayment(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody CreatePaymentRequest request) {

        PaymentUrlResponse response = paymentService.createMomoPayment(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * IPN endpoint – MoMo gọi server-to-server.
     * Body là JSON, không có JWT.
     */
    @PostMapping("/momo/ipn")
    @Operation(summary = "MoMo IPN callback (server-to-server, không cần auth)")
    public ResponseEntity<String> momoIpn(@RequestBody Map<String, Object> payload) {
        String result = paymentService.handleMomoIpn(payload);
        return ResponseEntity.ok(result);
    }

    // ── Chung ────────────────────────────────────────────────

    @GetMapping("/orders/{orderId}/status")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Lấy trạng thái thanh toán của đơn hàng")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentStatus(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable UUID orderId) {

        PaymentResponse response = paymentService.getPaymentStatus(orderId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── Helper ───────────────────────────────────────────────

    /**
     * Lấy IP thực của client (hỗ trợ reverse proxy / load balancer).
     */
    private String getClientIp(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For", "Proxy-Client-IP",
                "WL-Proxy-Client-IP", "HTTP_X_FORWARDED_FOR",
                "HTTP_CLIENT_IP", "HTTP_FORWARDED"
        };
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}