package com.toby.youngforever.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Tiện ích tạo chữ ký HMAC-SHA256 cho MoMo.
 * Tham khảo: https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
 */
public final class MomoUtils {

    private MomoUtils() {}

    /**
     * Tạo chữ ký HMAC-SHA256 từ raw data string.
     *
     * @param secretKey  secret key từ MoMo
     * @param data       chuỗi dữ liệu cần ký (đã được sắp xếp đúng thứ tự field)
     * @return chữ ký hex lowercase
     */
    public static String hmacSha256(String secretKey, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Không thể tạo HMAC-SHA256", e);
        }
    }

    /**
     * Xây dựng rawSignature theo chuẩn MoMo v2:
     * accessKey=...&amount=...&extraData=...&ipnUrl=...&orderId=...&orderInfo=...
     * &partnerCode=...&redirectUrl=...&requestId=...&requestType=...
     */
    public static String buildRawSignature(
            String accessKey,
            long amount,
            String extraData,
            String ipnUrl,
            String orderId,
            String orderInfo,
            String partnerCode,
            String redirectUrl,
            String requestId,
            String requestType) {

        return "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=" + requestType;
    }
}