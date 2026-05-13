package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.CreatePaymentRequest;
import com.toby.youngforever.dto.response.PaymentResponse;
import com.toby.youngforever.dto.response.PaymentUrlResponse;

import java.util.Map;
import java.util.UUID;

public interface PaymentService {

    /** Tạo URL thanh toán VNPay, lưu Payment record PENDING */
    PaymentUrlResponse createVnpayPayment(UUID userId, CreatePaymentRequest request, String ipAddress);

    /** Tạo URL thanh toán MoMo */
    PaymentUrlResponse createMomoPayment(UUID userId, CreatePaymentRequest request);

    /** Xử lý callback IPN từ VNPay (server-to-server) */
    String handleVnpayIpn(Map<String, String> params);

    /** Xử lý redirect return từ VNPay (trình duyệt redirect về) */
    PaymentResponse handleVnpayReturn(Map<String, String> params);

    /** Xử lý callback IPN từ MoMo */
    String handleMomoIpn(Map<String, Object> payload);

    /** Lấy trạng thái thanh toán của đơn hàng */
    PaymentResponse getPaymentStatus(UUID orderId, UUID userId);
}