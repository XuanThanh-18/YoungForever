package com.toby.youngforever.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateAddressRequest {
    @NotBlank private String fullName;

    @NotBlank
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$")
    private String phone;

    @NotBlank private String street;
    private String ward;
    @NotBlank private String district;
    @NotBlank private String city;
    private String postalCode;
    private Boolean isDefault = false;
}
