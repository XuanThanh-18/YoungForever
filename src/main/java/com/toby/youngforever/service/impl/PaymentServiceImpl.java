package com.toby.youngforever.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.toby.youngforever.config.MomoProperties;
import com.toby.youngforever.config.VnpayProperties;
import com.toby.youngforever.dto.request.CreatePaymentRequest;
import com.toby.youngforever.dto.response.PaymentResponse;
import com.toby.youngforever.dto.response.PaymentUrlResponse;
import com.toby.youngforever.entity.Order;
import com.toby.youngforever.entity.Payment;
import com.toby.youngforever.enums.OrderStatus;
import com.toby.youngforever.enums.PaymentMethod;
import com.toby.youngforever.enums.PaymentStatus;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.repository.OrderRepository;
import com.toby.youngforever.repository.PaymentRepository;
import com.toby.youngforever.service.NotificationService;
import com.toby.youngforever.service.PaymentService;
import com.toby.youngforever.util.MomoUtils;
import com.toby.youngforever.util.VnpayUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final DateTimeFormatter VNPAY_DATE_FMT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final OrderRepository     orderRepository;
    private final PaymentRepository   paymentRepository;
    private final NotificationService notificationService;
    private final VnpayProperties     vnpay;
    private final MomoProperties      momo;
    private final ObjectMapper        objectMapper;
    private final RestTemplate        restTemplate;

    // ── VNPay ────────────────────────────────────────────────

    @Override
    public PaymentUrlResponse createVnpayPayment(UUID userId,
                                                 CreatePaymentRequest request,
                                                 String ipAddress) {
        Order order = getAndValidateOrder(request.getOrderId(), userId);

        // Tạo hoặc lấy Payment record
        Payment payment = getOrCreatePayment(order, PaymentMethod.VNPAY);

        // VNPay nhận số tiền * 100 (không dấu phẩy)
        long amountVnd = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        String txnRef   = order.getOrderNumber();  // dùng order number làm mã GD
        String createAt = LocalDateTime.now().format(VNPAY_DATE_FMT);
        String expireAt = LocalDateTime.now().plusMinutes(15).format(VNPAY_DATE_FMT);

        Map<String, String> params = new LinkedHashMap<>();
        params.put("vnp_Version",    vnpay.getVersion());
        params.put("vnp_Command",    vnpay.getCommand());
        params.put("vnp_TmnCode",    vnpay.getTmnCode());
        params.put("vnp_Amount",     String.valueOf(amountVnd));
        params.put("vnp_CurrCode",   vnpay.getCurrCode());
        params.put("vnp_TxnRef",     txnRef);
        params.put("vnp_OrderInfo",  "Thanh toan don hang " + txnRef);
        params.put("vnp_OrderType",  vnpay.getOrderType());
        params.put("vnp_Locale",     request.getLocale());
        params.put("vnp_ReturnUrl",  request.getReturnUrl() != null
                ? request.getReturnUrl()
                : vnpay.getIpnUrl().replace("/ipn", "/return"));
        params.put("vnp_IpAddr",     ipAddress);
        params.put("vnp_CreateDate", createAt);
        params.put("vnp_ExpireDate", expireAt);

        // Lưu gatewayRef để tra cứu khi callback
        payment.setGatewayRef(txnRef);
        paymentRepository.save(payment);

        String secureHash = VnpayUtils.buildSecureHash(params, vnpay.getHashSecret());
        params.put("vnp_SecureHash", secureHash);

        String paymentUrl = vnpay.getPayUrl() + "?" + VnpayUtils.buildQueryString(params);

        log.info("[VNPay] Tạo URL thanh toán cho đơn {} – {}", txnRef, paymentUrl);

        return PaymentUrlResponse.builder()
                .paymentId(payment.getId())
                .paymentUrl(paymentUrl)
                .method("VNPAY")
                .orderNumber(order.getOrderNumber())
                .build();
    }

    @Override
    public String handleVnpayIpn(Map<String, String> params) {
        // 1. Xác thực chữ ký
        if (!VnpayUtils.verifySecureHash(params, vnpay.getHashSecret())) {
            log.warn("[VNPay IPN] Chữ ký không hợp lệ: {}", params);
            return "{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}";
        }

        String txnRef        = params.get("vnp_TxnRef");
        String responseCode  = params.get("vnp_ResponseCode");
        String transactionId = params.get("vnp_TransactionNo");
        long   paidAmount    = Long.parseLong(params.getOrDefault("vnp_Amount", "0")) / 100;

        Optional<Order> orderOpt = orderRepository.findByOrderNumber(txnRef);
        if (orderOpt.isEmpty()) {
            return "{\"RspCode\":\"01\",\"Message\":\"Order not found\"}";
        }

        Order   order   = orderOpt.get();
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> createPaymentRecord(order, PaymentMethod.VNPAY));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return "{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}";
        }

        // Kiểm tra số tiền
        long expectedAmount = order.getTotalAmount().longValue();
        if (paidAmount != expectedAmount) {
            log.error("[VNPay IPN] Số tiền không khớp: expected={} got={}", expectedAmount, paidAmount);
            return "{\"RspCode\":\"04\",\"Message\":\"Invalid Amount\"}";
        }

        // Cập nhật trạng thái
        if ("00".equals(responseCode)) {
            markPaymentSuccess(payment, order, transactionId, params);
        } else {
            markPaymentFailed(payment, order, params);
        }

        return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse handleVnpayReturn(Map<String, String> params) {
        if (!VnpayUtils.verifySecureHash(params, vnpay.getHashSecret())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chữ ký VNPay không hợp lệ");
        }

        String txnRef = params.get("vnp_TxnRef");
        Order order = orderRepository.findByOrderNumber(txnRef)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        return toResponse(payment, order);
    }

    // ── MoMo ────────────────────────────────────────────────

    @Override
    public PaymentUrlResponse createMomoPayment(UUID userId, CreatePaymentRequest request) {
        Order order = getAndValidateOrder(request.getOrderId(), userId);
        Payment payment = getOrCreatePayment(order, PaymentMethod.MOMO);

        String requestId  = UUID.randomUUID().toString();
        String orderId    = order.getOrderNumber() + "_" + System.currentTimeMillis();
        String orderInfo  = "Thanh toan don hang " + order.getOrderNumber();
        long   amount     = order.getTotalAmount().longValue();
        String extraData  = "";
        String requestType = "payWithMethod";

        // Lưu orderId momo để tra cứu khi callback
        payment.setGatewayRef(orderId);
        paymentRepository.save(payment);

        String rawSignature = MomoUtils.buildRawSignature(
                momo.getAccessKey(), amount, extraData,
                momo.getIpnUrl(), orderId, orderInfo,
                momo.getPartnerCode(), momo.getRedirectUrl(),
                requestId, requestType);

        String signature = MomoUtils.hmacSha256(momo.getSecretKey(), rawSignature);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode",  momo.getPartnerCode());
        body.put("partnerName",  momo.getPartnerName());
        body.put("requestId",    requestId);
        body.put("amount",       amount);
        body.put("orderId",      orderId);
        body.put("orderInfo",    orderInfo);
        body.put("redirectUrl",  momo.getRedirectUrl());
        body.put("ipnUrl",       momo.getIpnUrl());
        body.put("lang",         "vi");
        body.put("requestType",  requestType);
        body.put("extraData",    extraData);
        body.put("signature",    signature);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    URI.create(momo.getEndpoint()), HttpMethod.POST, entity, Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> result = response.getBody();
            if (result == null) throw new AppException(ErrorCode.INTERNAL_ERROR);

            String payUrl = (String) result.get("payUrl");
            log.info("[MoMo] Tạo URL thanh toán cho đơn {} – {}", orderId, payUrl);

            return PaymentUrlResponse.builder()
                    .paymentId(payment.getId())
                    .paymentUrl(payUrl)
                    .method("MOMO")
                    .orderNumber(order.getOrderNumber())
                    .build();

        } catch (Exception e) {
            log.error("[MoMo] Lỗi tạo URL: {}", e.getMessage());
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể kết nối tới MoMo");
        }
    }

    @Override
    public String handleMomoIpn(Map<String, Object> payload) {
        String orderId       = (String) payload.get("orderId");
        String resultCode    = String.valueOf(payload.get("resultCode"));
        String transactionId = String.valueOf(payload.get("transId"));
        String receivedSig   = (String) payload.get("signature");

        // Verify signature
        long amount = Long.parseLong(String.valueOf(payload.getOrDefault("amount", "0")));
        String requestId  = (String) payload.get("requestId");
        String orderInfo  = (String) payload.getOrDefault("orderInfo", "");
        String extraData  = (String) payload.getOrDefault("extraData", "");

        String rawSig = "accessKey=" + momo.getAccessKey()
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&message=" + payload.getOrDefault("message", "")
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&orderType=" + payload.getOrDefault("orderType", "")
                + "&partnerCode=" + momo.getPartnerCode()
                + "&payType=" + payload.getOrDefault("payType", "")
                + "&requestId=" + requestId
                + "&responseTime=" + payload.getOrDefault("responseTime", "")
                + "&resultCode=" + resultCode
                + "&transId=" + transactionId;

        String computed = MomoUtils.hmacSha256(momo.getSecretKey(), rawSig);
        if (!computed.equals(receivedSig)) {
            log.warn("[MoMo IPN] Chữ ký không hợp lệ orderId={}", orderId);
            return "{\"resultCode\":99}";
        }

        // Tìm payment theo gatewayRef
        Payment payment = paymentRepository.findByGatewayRef(orderId).orElse(null);
        if (payment == null) {
            return "{\"resultCode\":1}";
        }

        Order order = payment.getOrder();

        if (payment.getStatus() == PaymentStatus.PAID) {
            return "{\"resultCode\":0}";
        }

        if ("0".equals(resultCode)) {
            markPaymentSuccess(payment, order, transactionId, payload);
        } else {
            markPaymentFailed(payment, order, payload);
        }

        return "{\"resultCode\":0}";
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentStatus(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        return toResponse(payment, order);
    }

    // ── Private helpers ──────────────────────────────────────

    private Order getAndValidateOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getPaymentMethod() == PaymentMethod.COD) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Đơn hàng COD không cần thanh toán trực tuyến");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Đơn hàng không ở trạng thái chờ thanh toán");
        }
        return order;
    }

    private Payment getOrCreatePayment(Order order, PaymentMethod method) {
        return paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> createPaymentRecord(order, method));
    }

    private Payment createPaymentRecord(Order order, PaymentMethod method) {
        Payment p = Payment.builder()
                .order(order)
                .method(method)
                .status(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .currency("VND")
                .build();
        return paymentRepository.save(p);
    }

    private void markPaymentSuccess(Payment payment, Order order,
                                    String transactionId, Map<?, ?> rawPayload) {
        payment.setStatus(PaymentStatus.PAID);
        payment.setTransactionId(transactionId);
        payment.setPaidAt(LocalDateTime.now());

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = (Map<String, Object>) rawPayload;
            payment.setGatewayPayload(payload);
        } catch (Exception ignored) {}

        paymentRepository.save(payment);

        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());
        orderRepository.save(order);

        notificationService.sendOrderStatusUpdate(order.getUser().getId(), order);
        log.info("[Payment] Thanh toán thành công: orderId={} txn={}", order.getId(), transactionId);
    }

    private void markPaymentFailed(Payment payment, Order order, Map<?, ?> rawPayload) {
        payment.setStatus(PaymentStatus.FAILED);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = (Map<String, Object>) rawPayload;
            payment.setGatewayPayload(payload);
        } catch (Exception ignored) {}

        paymentRepository.save(payment);
        log.warn("[Payment] Thanh toán thất bại: orderId={}", order.getId());
    }

    private PaymentResponse toResponse(Payment p, Order order) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .method(p.getMethod())
                .status(p.getStatus())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .transactionId(p.getTransactionId())
                .paidAt(p.getPaidAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}