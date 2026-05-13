package com.toby.youngforever.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.momo")
public class MomoProperties {

    /** Partner Code do MoMo cấp */
    private String partnerCode;

    /** Access Key */
    private String accessKey;

    /** Secret Key để tạo chữ ký HMAC-SHA256 */
    private String secretKey;

    /** URL API MoMo (sandbox / production) */
    private String endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";

    /** URL backend nhận IPN (server-to-server) */
    private String ipnUrl;

    /** URL redirect trình duyệt sau thanh toán */
    private String redirectUrl;

    /** Tên hiển thị trên trang MoMo */
    private String partnerName = "YoungForever";
}