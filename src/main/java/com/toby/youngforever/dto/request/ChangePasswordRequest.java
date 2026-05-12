package com.toby.youngforever.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank private String currentPassword;

    @NotBlank
    @Size(min = 8, message = "Mật khẩu mới phải ít nhất 8 ký tự")
    private String newPassword;
}
