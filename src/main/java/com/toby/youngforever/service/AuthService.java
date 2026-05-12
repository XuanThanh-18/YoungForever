package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.*;
import com.toby.youngforever.dto.response.AuthResponse;
import com.toby.youngforever.entity.User;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void verifyEmail(String email, String otpCode);

}
