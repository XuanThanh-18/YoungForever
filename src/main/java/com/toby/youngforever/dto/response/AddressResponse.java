package com.toby.youngforever.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class AddressResponse {
    private UUID id;
    private String fullName;
    private String phone;
    private String street;
    private String ward;
    private String district;
    private String city;
    private String country;
    private Boolean isDefault;
}
