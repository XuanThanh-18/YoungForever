package com.toby.youngforever.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.vnpay")
public class VnpayProperties {

    /** Terminal ID do VNPay cấp */
    private String tmnCode;

    /** Secret key để tạo chữ ký HMAC-SHA512 */
    private String hashSecret;

    /** URL API của VNPay (sandbox / production) */
    private String payUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    /** URL backend nhận IPN (server-to-server) */
    private String ipnUrl;

    /** Phiên bản API VNPay */
    private String version = "2.1.0";

    /** Lệnh thanh toán */
    private String command = "pay";

    /** Loại tiền tệ */
    private String currCode = "VND";

    /** Loại đơn hàng (mặc định: mua hàng) */
    private String orderType = "other";
}