package com.toby.youngforever.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Cloudinary cloudinary = new Cloudinary();
    private Mail mail = new Mail();
    private Pagination pagination = new Pagination();
    private Cors cors = new Cors();

    @Bean
    public RestTemplate restTemplate() {
       return new RestTemplate();
   }

    @Data
    public static class Jwt {
        private String secret;
        private long accessTokenExpiryMs;
        private long refreshTokenExpiryMs;
    }

    @Data
    public static class Cloudinary {
        private String cloudName;
        private String apiKey;
        private String apiSecret;
        private String folder;
    }

    @Data
    public static class Mail {
        private String from;
        private String fromName;
    }

    @Data
    public static class Pagination {
        private int defaultPage = 0;
        private int defaultSize = 20;
        private int maxSize = 100;
    }

    @Data
    public static class Cors {
        private List<String> allowedOrigins;
    }
}
