package com.toby.youngforever.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Tiện ích tạo chữ ký HMAC-SHA512 cho VNPay.
 * Tham khảo tài liệu: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
 */
public final class VnpayUtils {

    private VnpayUtils() {}

    /**
     * Tạo chuỗi hash data và chữ ký HMAC-SHA512.
     *
     * @param params     map tham số (sẽ được sắp xếp theo key A-Z)
     * @param secretKey  secret key từ VNPay
     * @return chữ ký hex lowercase
     */
    public static String buildSecureHash(Map<String, String> params, String secretKey) {
        // Loại bỏ vnp_SecureHash và vnp_SecureHashType khỏi dữ liệu ký
        TreeMap<String, String> sorted = new TreeMap<>(params);
        sorted.remove("vnp_SecureHash");
        sorted.remove("vnp_SecureHashType");

        String hashData = sorted.entrySet().stream()
                .map(e -> urlEncode(e.getKey()) + "=" + urlEncode(e.getValue()))
                .collect(Collectors.joining("&"));

        return hmacSha512(secretKey, hashData);
    }

    /**
     * Xây dựng query string để appended vào payment URL (giá trị đã encode).
     */
    public static String buildQueryString(Map<String, String> params) {
        TreeMap<String, String> sorted = new TreeMap<>(params);
        return sorted.entrySet().stream()
                .map(e -> urlEncode(e.getKey()) + "=" + urlEncode(e.getValue()))
                .collect(Collectors.joining("&"));
    }

    /**
     * Kiểm tra chữ ký VNPay trả về khi callback.
     */
    public static boolean verifySecureHash(Map<String, String> params, String secretKey) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) return false;
        String computed = buildSecureHash(params, secretKey);
        return computed.equalsIgnoreCase(receivedHash);
    }

    // ── private helpers ─────────────────────────────────────

    private static String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Không thể tạo HMAC-SHA512", e);
        }
    }

    private static String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}